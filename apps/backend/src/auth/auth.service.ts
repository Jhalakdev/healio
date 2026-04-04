import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  // ─── PATIENT: Phone + OTP ───────────────────────

  async sendOtp(phone: string): Promise<{ message: string }> {
    const otpTtl = this.config.get<number>('OTP_EXPIRY_SECONDS', 300);
    const isDev = this.config.get<string>('NODE_ENV') === 'development';

    // In dev, OTP is always 123456
    const otp = isDev
      ? '123456'
      : Math.floor(100000 + Math.random() * 900000).toString();

    await this.redis.setOtp(phone, otp, otpTtl);

    if (!isDev) {
      // TODO: integrate SMS provider (Twilio, MSG91, etc.)
      console.log(`[SMS] OTP for ${phone}: ${otp}`);
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(
    phone: string,
    otp: string,
  ): Promise<TokenPair & { isNewUser: boolean; familyPlan: any }> {
    const storedOtp = await this.redis.getOtp(phone);

    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.redis.deleteOtp(phone);

    // Auto-create patient account if not exists
    let user = await this.prisma.user.findUnique({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          role: Role.PATIENT,
          patient: { create: {} },
        },
      });

      // Create wallet for new patient
      await this.prisma.wallet.create({ data: { userId: user.id } });
      isNewUser = true;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if this phone is listed as a family member in another account
    // If so, link this user's account to that family member record
    let familyPlan: any = null;
    const familyMemberRecord = await this.prisma.familyMember.findFirst({
      where: { phoneNumber: phone, linkedUserId: null },
      include: {
        patient: {
          include: {
            subscriptions: {
              where: {
                isActive: true,
                consultationsRemaining: { gt: 0 },
                expiresAt: { gt: new Date() },
              },
              include: { plan: true },
              take: 1,
            },
          },
        },
      },
    });

    if (familyMemberRecord) {
      // Link this user to the family member record
      await this.prisma.familyMember.update({
        where: { id: familyMemberRecord.id },
        data: { linkedUserId: user.id, isVerified: true },
      });

      // Check if the family owner has an active plan
      const ownerPlan = familyMemberRecord.patient.subscriptions[0];
      if (ownerPlan) {
        familyPlan = {
          ownerName: familyMemberRecord.patient.name,
          planName: ownerPlan.plan.name,
          consultationsRemaining: ownerPlan.consultationsRemaining,
          expiresAt: ownerPlan.expiresAt,
          message: `You're on ${familyMemberRecord.patient.name}'s family plan!`,
        };
      }
    }

    const tokens = await this.generateTokens({ sub: user.id, role: user.role });
    return { ...tokens, isNewUser, familyPlan };
  }

  // ─── DOCTOR: Email + Password ───────────────────

  async doctorRegister(
    email: string,
    password: string,
    name: string,
  ): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.DOCTOR,
        doctor: { create: { name } },
      },
    });

    return { message: 'Registration successful. Pending admin approval.' };
  }

  async doctorLogin(email: string, password: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { doctor: true },
    });

    if (!user || user.role !== Role.DOCTOR) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.doctor?.verificationStatus !== 'APPROVED') {
      throw new UnauthorizedException(
        `Account is ${user.doctor?.verificationStatus?.toLowerCase() || 'pending verification'}`,
      );
    }

    return this.generateTokens({ sub: user.id, role: user.role });
  }

  // ─── ADMIN LOGIN ────────────────────────────────

  async adminLogin(email: string, password: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.role !== Role.ADMIN || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens({ sub: user.id, role: user.role });
  }

  // ─── TOKENS ─────────────────────────────────────

  async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens({ sub: user.id, role: user.role });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
