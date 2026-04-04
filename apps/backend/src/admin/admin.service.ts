import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Decimal } from '@prisma/client/runtime/library';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ─── DASHBOARD ──────────────────────────────────
  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      totalDoctors,
      activeSessions,
      todayRevenue,
      totalRevenue,
      failedConsultations,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.doctor.count(),
      this.prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.transaction.aggregate({
        where: { type: 'DEBIT', createdAt: { gte: today } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: 'DEBIT' },
        _sum: { amount: true },
      }),
      this.prisma.booking.count({
        where: { status: { in: ['CANCELLED', 'NO_SHOW'] } },
      }),
    ]);

    const onlineDoctors = await this.redis.getOnlineDoctors();

    return {
      totalPatients,
      totalDoctors,
      onlineDoctors: onlineDoctors.length,
      activeSessions,
      todayRevenue: todayRevenue._sum.amount || 0,
      totalRevenue: totalRevenue._sum.amount || 0,
      failedConsultations,
    };
  }

  // ─── DOCTOR MANAGEMENT ──────────────────────────
  async listDoctors(status?: VerificationStatus) {
    return this.prisma.doctor.findMany({
      where: status ? { verificationStatus: status } : undefined,
      include: { user: { select: { email: true, isActive: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateDoctorStatus(doctorId: string, status: VerificationStatus) {
    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: { verificationStatus: status },
    });
  }

  async blockDoctor(doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    await this.prisma.$transaction([
      this.prisma.doctor.update({
        where: { id: doctorId },
        data: { verificationStatus: 'SUSPENDED' },
      }),
      this.prisma.user.update({
        where: { id: doctor.userId },
        data: { isActive: false },
      }),
    ]);

    await this.redis.setDoctorOffline(doctorId);
    return { message: 'Doctor blocked' };
  }

  async setDoctorPrice(doctorId: string, price: number) {
    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: { consultationFee: new Decimal(price) },
    });
  }

  // ─── BOOKING MANAGEMENT ─────────────────────────
  async listBookings(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : undefined;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          patient: { select: { name: true } },
          doctor: { select: { name: true, specialization: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data: bookings, meta: { total, page, limit } };
  }

  async cancelBooking(bookingId: string, reason: string) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancelReason: reason },
    });
  }

  // ─── DYNAMIC PRICING ───────────────────────────
  async setGlobalConfig(key: string, value: any) {
    return this.prisma.appConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async getConfig(key: string) {
    return this.prisma.appConfig.findUnique({ where: { key } });
  }

  // ─── COUPON ENGINE ──────────────────────────────
  async createCoupon(data: {
    code: string;
    discountType: string;
    discountValue: number;
    maxUsage?: number;
    expiresAt?: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: new Decimal(data.discountValue),
        maxUsage: data.maxUsage || 0,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async listCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async deactivateCoupon(couponId: string) {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });
  }

  // ─── PLAN MANAGEMENT ───────────────────────────
  async createPlan(data: {
    name: string;
    price: number;
    consultations: number;
    validityDays: number;
  }) {
    return this.prisma.plan.create({
      data: {
        name: data.name,
        price: new Decimal(data.price),
        consultations: data.consultations,
        validityDays: data.validityDays,
      },
    });
  }

  async listPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  // ─── ANALYTICS ──────────────────────────────────
  async getAnalytics() {
    const [avgDuration, revenueByDoctor] = await Promise.all([
      this.prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _avg: { durationMin: true },
      }),
      this.prisma.$queryRaw`
        SELECT d.name, d.id, SUM(t.amount) as total_earnings, COUNT(b.id) as total_consultations
        FROM doctors d
        JOIN bookings b ON b."doctorId" = d.id
        JOIN transactions t ON t."bookingId" = b.id AND t.type = 'CREDIT'
        GROUP BY d.id, d.name
        ORDER BY total_earnings DESC
        LIMIT 20
      `,
    ]);

    return {
      avgConsultationDuration: avgDuration._avg.durationMin || 0,
      topDoctors: revenueByDoctor,
    };
  }
}
