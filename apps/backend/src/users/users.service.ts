import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePatientProfileDto } from './dto/update-patient.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getPatientProfile(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: {
        user: { select: { phone: true, email: true, role: true, createdAt: true } },
        familyMembers: { orderBy: { createdAt: 'asc' } },
        subscriptions: {
          where: { isActive: true, expiresAt: { gt: new Date() } },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    // Check if this user is a linked family member of another account
    const linkedMembership = await this.prisma.familyMember.findFirst({
      where: { linkedUserId: userId },
      include: {
        patient: {
          include: {
            user: { select: { phone: true } },
            familyMembers: { orderBy: { createdAt: 'asc' } },
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

    // If user is part of another family, sync that family's data
    const familyGroup = linkedMembership
      ? {
          ownerId: linkedMembership.patientId,
          ownerName: linkedMembership.patient.name,
          myRelation: linkedMembership.relation,
          members: linkedMembership.patient.familyMembers,
          sharedPlan: linkedMembership.patient.subscriptions[0] || null,
        }
      : null;

    return {
      ...patient,
      ownPlan: patient.subscriptions[0] || null,
      familyGroup,
    };
  }

  async updatePatientProfile(userId: string, dto: UpdatePatientProfileDto) {
    return this.prisma.patient.update({
      where: { userId },
      data: {
        name: dto.name,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
        height: dto.height,
        weight: dto.weight,
        bloodGroup: dto.bloodGroup,
        avatarUrl: dto.avatarUrl,
      },
    });
  }

  // ─── PATIENT BOOKINGS (filtered by status) ────────

  async getPatientBookings(
    userId: string,
    filter: 'upcoming' | 'past' | 'cancelled' | 'all' = 'all',
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const now = new Date();
    const statusFilter = (() => {
      switch (filter) {
        case 'upcoming':
          return {
            status: { in: ['PENDING', 'CONFIRMED'] as any[] },
            scheduledAt: { gte: now },
          };
        case 'past':
          return {
            status: { in: ['COMPLETED', 'NO_SHOW'] as any[] },
          };
        case 'cancelled':
          return { status: 'CANCELLED' as any };
        default:
          return {};
      }
    })();

    return this.prisma.booking.findMany({
      where: { patientId: patient.id, ...statusFilter },
      include: {
        doctor: { select: { name: true, specialization: true, avatarUrl: true } },
        prescription: true,
        review: true,
      },
      orderBy: { scheduledAt: filter === 'upcoming' ? 'asc' : 'desc' },
    });
  }

  async getPatientHistory(patientId: string) {
    return this.prisma.booking.findMany({
      where: { patientId },
      include: {
        doctor: { select: { name: true, specialization: true, avatarUrl: true } },
        prescription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── FAMILY MEMBERS (max 5: 3 adults + 2 children OR 2 adults + 3 children) ───

  async addFamilyMember(
    userId: string,
    data: {
      name: string;
      relation: string;
      isChild?: boolean;
      age?: number;
      dob?: string;
      gender?: string;
      bloodGroup?: string;
      photoUrl?: string;
      phoneNumber?: string;
    },
  ) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    // Get current members
    const existing = await this.prisma.familyMember.findMany({
      where: { patientId: patient.id },
    });

    // Total limit: 5 members
    if (existing.length >= 5) {
      throw new BadRequestException(
        'Maximum 5 family members allowed per account',
      );
    }

    const adultCount = existing.filter((m) => !m.isChild).length;
    const childCount = existing.filter((m) => m.isChild).length;
    const isChild = data.isChild || false;

    // Adult limit: max 3
    if (!isChild && adultCount >= 3) {
      throw new BadRequestException(
        'Maximum 3 adult members allowed. You already have ' + adultCount,
      );
    }

    // Child limit: max 3
    if (isChild && childCount >= 3) {
      throw new BadRequestException(
        'Maximum 3 child members allowed. You already have ' + childCount,
      );
    }

    // If age >= 18, phone verification is required
    if (data.age && data.age >= 18 && !data.phoneNumber) {
      throw new BadRequestException(
        'Phone number is required for members aged 18 or older',
      );
    }

    return this.prisma.familyMember.create({
      data: {
        patientId: patient.id,
        name: data.name,
        relation: data.relation,
        isChild,
        age: data.age,
        dob: data.dob ? new Date(data.dob) : undefined,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        photoUrl: data.photoUrl,
        phoneNumber: data.phoneNumber,
        isVerified: isChild && (!data.age || data.age < 18), // children auto-verified
      },
    });
  }

  async getFamilyMembers(userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.familyMember.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async removeFamilyMember(userId: string, memberId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const member = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.patientId !== patient.id) {
      throw new NotFoundException('Family member not found');
    }

    return this.prisma.familyMember.delete({ where: { id: memberId } });
  }

  // ─── FAVOURITE DOCTORS ────────────────────────────

  async toggleFavourite(userId: string, doctorId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const existing = await this.prisma.favouriteDoctor.findUnique({
      where: { patientId_doctorId: { patientId: patient.id, doctorId } },
    });

    if (existing) {
      await this.prisma.favouriteDoctor.delete({ where: { id: existing.id } });
      return { favourited: false };
    }

    await this.prisma.favouriteDoctor.create({
      data: { patientId: patient.id, doctorId },
    });
    return { favourited: true };
  }

  async getFavouriteDoctors(userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.favouriteDoctor.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            consultationFee: true,
            avatarUrl: true,
            isOnline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── CONVERSATIONS / INBOX ────────────────────────

  async getConversations(userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    // Get bookings that have messages, grouped by doctor
    const bookingsWithMessages = await this.prisma.booking.findMany({
      where: {
        patientId: patient.id,
        messages: { some: {} },
      },
      include: {
        doctor: { select: { id: true, name: true, specialization: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // last message only
          select: { content: true, type: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return bookingsWithMessages.map((b) => ({
      bookingId: b.id,
      doctor: b.doctor,
      lastMessage: b.messages[0] || null,
      unreadCount: 0, // TODO: track unread per booking
    }));
  }
}
