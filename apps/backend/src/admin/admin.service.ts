import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { Decimal } from '@prisma/client/runtime/library';
import { VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private storage: StorageService,
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
    type?: string;
    price: number;
    consultations: number;
    maxMembers?: number;
    validityDays: number;
    childDiscountPercent?: number;
    description?: string;
    features?: string[];
    sortOrder?: number;
  }) {
    return this.prisma.plan.create({
      data: {
        name: data.name,
        type: data.type || 'single',
        price: new Decimal(data.price),
        consultations: data.consultations,
        maxMembers: data.maxMembers || 1,
        validityDays: data.validityDays,
        childDiscountPercent: data.childDiscountPercent ? new Decimal(data.childDiscountPercent) : new Decimal(10),
        description: data.description,
        features: data.features || [],
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  async updatePlan(planId: string, data: {
    name?: string;
    type?: string;
    price?: number;
    consultations?: number;
    maxMembers?: number;
    validityDays?: number;
    childDiscountPercent?: number;
    description?: string;
    features?: string[];
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.plan.update({
      where: { id: planId },
      data: {
        ...data,
        price: data.price ? new Decimal(data.price) : undefined,
        childDiscountPercent: data.childDiscountPercent ? new Decimal(data.childDiscountPercent) : undefined,
      },
    });
  }

  async listPlans() {
    return this.prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
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

  // ─── DOCTOR DOCUMENT REVIEW ─────────────────────
  async getDoctorDocuments(doctorId: string) {
    const docs = await this.prisma.doctorDocument.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      docs.map(async (doc) => ({
        ...doc,
        fileUrl: await this.storage.getSignedUrl(doc.fileUrl),
      })),
    );
  }

  async verifyDocument(documentId: string, verified: boolean) {
    return this.prisma.doctorDocument.update({
      where: { id: documentId },
      data: { verified },
    });
  }

  // ─── ADMIN PERMISSION MANAGEMENT ────────────────
  async createAdminUser(email: string, password: string, modules: { module: string; canRead: boolean; canWrite: boolean; canDelete: boolean }[]) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    // Create permissions for each module
    for (const perm of modules) {
      await this.prisma.adminPermission.create({
        data: {
          userId: user.id,
          module: perm.module,
          canRead: perm.canRead,
          canWrite: perm.canWrite,
          canDelete: perm.canDelete,
        },
      });
    }

    return { id: user.id, email: user.email, permissions: modules };
  }

  async getAdminPermissions(userId: string) {
    return this.prisma.adminPermission.findMany({
      where: { userId },
    });
  }

  async updateAdminPermissions(userId: string, module: string, data: { canRead?: boolean; canWrite?: boolean; canDelete?: boolean }) {
    return this.prisma.adminPermission.upsert({
      where: { userId_module: { userId, module } },
      create: { userId, module, ...data },
      update: data,
    });
  }

  async listAdminUsers() {
    return this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  // ─── FAQ MANAGEMENT ─────────────────────────────
  async createFaq(data: { question: string; answer: string; category?: string; sortOrder?: number }) {
    return this.prisma.faq.create({ data });
  }

  async listFaqs() {
    return this.prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async updateFaq(id: string, data: any) {
    return this.prisma.faq.update({ where: { id }, data });
  }

  async deleteFaq(id: string) {
    return this.prisma.faq.delete({ where: { id } });
  }

  // ─── CMS PAGES (Terms, Privacy, About, Refund) ──
  async upsertCmsPage(slug: string, data: { title: string; content: string }) {
    return this.prisma.cmsPage.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
  }

  async getCmsPage(slug: string) {
    return this.prisma.cmsPage.findUnique({ where: { slug } });
  }

  async listCmsPages() {
    return this.prisma.cmsPage.findMany();
  }

  // ─── BANNERS / ANNOUNCEMENTS ────────────────────
  async createBanner(data: {
    title: string; subtitle?: string; imageUrl?: string;
    linkUrl?: string; target?: string; startDate?: string; endDate?: string;
  }) {
    return this.prisma.banner.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async listBanners() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async updateBanner(id: string, data: any) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }

  // Active banners for app (filtered by date + target)
  async getActiveBanners(target: string = 'all') {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        target: { in: [target, 'all'] },
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ─── USER / PATIENT MANAGEMENT ──────────────────
  async listPatients(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        include: {
          user: { select: { phone: true, email: true, isActive: true, createdAt: true } },
          _count: { select: { bookings: true, familyMembers: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count(),
    ]);
    return { data: patients, meta: { total, page, limit } };
  }

  async deactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  // ─── VIEW ALL REPORTS / PRESCRIPTIONS ───────────
  async listAllReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.report.findMany({
      include: {
        patient: { select: { name: true } },
        booking: { select: { id: true, doctorId: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllPrescriptions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.prescription.findMany({
      include: {
        booking: {
          select: {
            id: true,
            patient: { select: { name: true } },
            doctor: { select: { name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── SEND NOTIFICATION TO USERS ─────────────────
  async sendNotification(data: {
    userId?: string; // specific user, or null for broadcast
    type: string;
    title: string;
    body: string;
  }) {
    if (data.userId) {
      return this.prisma.notification.create({
        data: { userId: data.userId, type: data.type, title: data.title, body: data.body },
      });
    }

    // Broadcast to all patients
    const patients = await this.prisma.user.findMany({
      where: { role: 'PATIENT', isActive: true },
      select: { id: true },
    });

    return this.prisma.notification.createMany({
      data: patients.map((p) => ({
        userId: p.id,
        type: data.type,
        title: data.title,
        body: data.body,
      })),
    });
  }

  // ─── COMMISSION RATE MANAGEMENT ─────────────────
  async getCommissionRate() {
    const config = await this.prisma.appConfig.findUnique({
      where: { key: 'platform_commission_percent' },
    });
    return { commissionPercent: config?.value || 30 };
  }

  async setCommissionRate(percent: number) {
    return this.setGlobalConfig('platform_commission_percent', percent);
  }
}
