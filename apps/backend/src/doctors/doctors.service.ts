import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { UpdateDoctorProfileDto } from './dto/update-doctor.dto';
import { ListDoctorsDto } from './dto/list-doctors.dto';

@Injectable()
export class DoctorsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
    private storage: StorageService,
  ) {}

  async listDoctors(query: ListDoctorsDto) {
    const onlineDoctorIds = await this.redis.getOnlineDoctors();

    const doctors = await this.prisma.doctor.findMany({
      where: {
        verificationStatus: 'APPROVED',
        ...(query.specialization && { specialization: query.specialization }),
        // Multi-category: if categoryId provided, find doctors who have this category in their list
        ...(query.categoryId && {
          categories: { some: { categoryId: query.categoryId } },
        }),
        ...(query.onlineOnly && { id: { in: onlineDoctorIds } }),
        ...(query.search && {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { specialization: { contains: query.search, mode: 'insensitive' as const } },
            { qualifications: { has: query.search } },
            // Search in linked category names
            { categories: { some: { category: { name: { contains: query.search, mode: 'insensitive' as const } } } } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        qualifications: true,
        specialization: true,
        experience: true,
        consultationFee: true,
        avatarUrl: true,
        isOnline: true,
        lastSeenAt: true,
        avgResponseMin: true,
        categories: { include: { category: { select: { id: true, name: true, icon: true } } } },
        _count: { select: { reviews: true, bookings: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Enrich with real-time online status from Redis
    return doctors.map((doc) => ({
      ...doc,
      isOnline: onlineDoctorIds.includes(doc.id),
    }));
  }

  // Full profile for the logged-in doctor (includes everything)
  async getFullProfile(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, phone: true, createdAt: true } },
        categories: { include: { category: { select: { id: true, name: true, icon: true } } } },
        documents: { orderBy: { createdAt: 'desc' } },
        slots: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const isOnline = await this.redis.isDoctorOnline(doctor.id);
    return { ...doctor, isOnline };
  }

  async updateOnboardingStep(userId: string, step: number) {
    return this.prisma.doctor.update({
      where: { userId },
      data: { onboardingStep: step },
    });
  }

  async getDoctorProfile(doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        slots: true,
        user: { select: { email: true, createdAt: true } },
      },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const isOnline = await this.redis.isDoctorOnline(doctor.id);
    return { ...doctor, isOnline };
  }

  async getDoctorByUserId(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return doctor;
  }

  async updateProfile(userId: string, dto: UpdateDoctorProfileDto) {
    const { qualification, specialization, documentsUrl, ...rest } = dto;
    const data: any = { ...rest };
    if (qualification) {
      data.qualifications = qualification.split(',').map((q: string) => q.trim()).filter(Boolean);
    }
    if (specialization) {
      data.specialization = specialization;
    }
    return this.prisma.doctor.update({
      where: { userId },
      data,
    });
  }

  async toggleOnline(userId: string, isOnline: boolean) {
    const doctor = await this.getDoctorByUserId(userId);

    if (isOnline) {
      await this.redis.setDoctorOnline(doctor.id);
    } else {
      await this.redis.setDoctorOffline(doctor.id);
    }

    await this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { isOnline, lastSeenAt: new Date() },
    });

    return { isOnline };
  }

  async getDashboard(userId: string) {
    const doctor = await this.getDoctorByUserId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayBookings, totalEarnings] = await Promise.all([
      this.prisma.booking.count({
        where: {
          doctorId: doctor.id,
          scheduledAt: { gte: today, lt: tomorrow },
          status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId: doctor.userId,
          type: 'CREDIT',
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      todayBookings,
      totalEarnings: totalEarnings._sum.amount || 0,
      isOnline: await this.redis.isDoctorOnline(doctor.id),
    };
  }

  async manageSlots(
    userId: string,
    slots: { dayOfWeek: number; startTime: string; endTime: string; isBreak?: boolean }[],
  ) {
    const doctor = await this.getDoctorByUserId(userId);

    // Replace all slots
    await this.prisma.$transaction([
      this.prisma.doctorSlot.deleteMany({ where: { doctorId: doctor.id } }),
      ...slots.map((slot) =>
        this.prisma.doctorSlot.create({
          data: { ...slot, doctorId: doctor.id },
        }),
      ),
    ]);

    return this.prisma.doctorSlot.findMany({ where: { doctorId: doctor.id } });
  }

  // ─── SCHEDULING: Get available time slots for a doctor on a date ────

  async getAvailableSlots(
    doctorId: string,
    date: string, // "2026-04-10"
    timezone: string = 'Asia/Kolkata',
  ): Promise<{ slots: { startTime: string; endTime: string; available: boolean }[] }> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { slots: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const consultationDuration = this.config.get<number>(
      'DEFAULT_CONSULTATION_DURATION_MINUTES',
      15,
    );

    // Parse the target date
    const targetDate = new Date(date + 'T00:00:00');
    const dayOfWeek = targetDate.getDay(); // 0=Sunday

    // Get doctor's slots for this day of week (exclude breaks)
    const daySlots = doctor.slots.filter(
      (s) => s.dayOfWeek === dayOfWeek && !s.isBreak,
    );

    if (daySlots.length === 0) {
      return { slots: [] };
    }

    // Get break slots for this day
    const breakSlots = doctor.slots.filter(
      (s) => s.dayOfWeek === dayOfWeek && s.isBreak,
    );

    // Get existing bookings for this doctor on this date
    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd = new Date(date + 'T23:59:59');
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        doctorId,
        scheduledAt: { gte: dayStart, lte: dayEnd },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      select: { scheduledAt: true, durationMin: true },
    });

    // Generate time slots
    const allSlots: { startTime: string; endTime: string; available: boolean }[] = [];

    for (const daySlot of daySlots) {
      const [startH, startM] = daySlot.startTime.split(':').map(Number);
      const [endH, endM] = daySlot.endTime.split(':').map(Number);

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + consultationDuration <= endMinutes) {
        const slotStartH = Math.floor(currentMinutes / 60);
        const slotStartM = currentMinutes % 60;
        const slotEndMinutes = currentMinutes + consultationDuration;
        const slotEndH = Math.floor(slotEndMinutes / 60);
        const slotEndM = slotEndMinutes % 60;

        const startTimeStr = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
        const endTimeStr = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

        // Check if this slot falls in a break
        const isBreak = breakSlots.some((b) => {
          const [bStartH, bStartM] = b.startTime.split(':').map(Number);
          const [bEndH, bEndM] = b.endTime.split(':').map(Number);
          const breakStart = bStartH * 60 + bStartM;
          const breakEnd = bEndH * 60 + bEndM;
          return currentMinutes < breakEnd && slotEndMinutes > breakStart;
        });

        // Check if slot is already booked
        const slotDateTime = new Date(date + `T${startTimeStr}:00`);
        const isBooked = existingBookings.some((booking) => {
          const bookingStart = booking.scheduledAt.getTime();
          const bookingEnd = bookingStart + booking.durationMin * 60 * 1000;
          const slotStart = slotDateTime.getTime();
          const slotEnd = slotStart + consultationDuration * 60 * 1000;
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });

        // Check if slot is in the past
        const now = new Date();
        const isPast = slotDateTime < now;

        allSlots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          available: !isBreak && !isBooked && !isPast,
        });

        currentMinutes += consultationDuration;
      }
    }

    return { slots: allSlots };
  }

  // Validate that a requested time is actually available for this doctor
  async validateSlotAvailability(
    doctorId: string,
    scheduledAt: Date,
  ): Promise<void> {
    const date = scheduledAt.toISOString().split('T')[0];
    const hours = String(scheduledAt.getHours()).padStart(2, '0');
    const minutes = String(scheduledAt.getMinutes()).padStart(2, '0');
    const requestedTime = `${hours}:${minutes}`;

    const { slots } = await this.getAvailableSlots(doctorId, date);

    if (slots.length === 0) {
      throw new BadRequestException('Doctor has no slots on this date');
    }

    const matchingSlot = slots.find((s) => s.startTime === requestedTime);

    if (!matchingSlot) {
      throw new BadRequestException(
        `No slot available at ${requestedTime}. Check available slots first.`,
      );
    }

    if (!matchingSlot.available) {
      throw new BadRequestException(
        `The ${requestedTime} slot is already booked or unavailable`,
      );
    }
  }

  // Check for booking conflicts (double-booking prevention)
  async checkConflict(
    doctorId: string,
    scheduledAt: Date,
    durationMin: number,
    excludeBookingId?: string,
  ): Promise<void> {
    const bookingEnd = new Date(
      scheduledAt.getTime() + durationMin * 60 * 1000,
    );

    const conflict = await this.prisma.booking.findFirst({
      where: {
        doctorId,
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        AND: [
          { scheduledAt: { lt: bookingEnd } },
          {
            scheduledAt: {
              gte: new Date(
                scheduledAt.getTime() - durationMin * 60 * 1000,
              ),
            },
          },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'This time slot conflicts with an existing booking',
      );
    }
  }

  // Matching engine: find best available doctor for instant consult
  async findAvailableDoctor(specialization?: string): Promise<string | null> {
    const onlineDoctorIds = await this.redis.getOnlineDoctors();
    if (onlineDoctorIds.length === 0) return null;

    // Get online doctors, sorted by least active sessions
    const doctors = await this.prisma.doctor.findMany({
      where: {
        id: { in: onlineDoctorIds },
        verificationStatus: 'APPROVED',
        ...(specialization && { specialization }),
      },
      select: { id: true, userId: true },
    });

    // Find least busy: check active sessions in Redis
    let leastBusyDoctor: string | null = null;
    let minSessions = Infinity;

    for (const doc of doctors) {
      const activeSession = await this.redis.getDoctorActiveSession(doc.id);
      const sessionCount = activeSession ? 1 : 0;
      if (sessionCount < minSessions) {
        minSessions = sessionCount;
        leastBusyDoctor = doc.id;
      }
    }

    return leastBusyDoctor;
  }

  // ─── DOCTOR DOCUMENT UPLOAD ───────────────────────

  async uploadDocument(
    userId: string,
    type: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const doctor = await this.getDoctorByUserId(userId);

    const { key } = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      `doctor-documents/${doctor.id}`,
    );

    return this.prisma.doctorDocument.create({
      data: {
        doctorId: doctor.id,
        type,
        fileName: file.originalname,
        fileUrl: key,
      },
    });
  }

  async getDocuments(doctorId: string) {
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

  // ─── CATEGORIES (multi-select) ─────────────────────

  async setCategories(userId: string, categoryIds: string[]) {
    const doctor = await this.getDoctorByUserId(userId);

    // Remove existing
    await this.prisma.doctorCategory.deleteMany({ where: { doctorId: doctor.id } });

    // Add new
    if (categoryIds.length > 0) {
      await this.prisma.doctorCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          doctorId: doctor.id,
          categoryId,
        })),
      });
    }

    return this.prisma.doctorCategory.findMany({
      where: { doctorId: doctor.id },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });
  }

  async getMyCategories(userId: string) {
    const doctor = await this.getDoctorByUserId(userId);
    return this.prisma.doctorCategory.findMany({
      where: { doctorId: doctor.id },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });
  }

  // Admin: assign categories to a doctor
  async adminSetCategories(doctorId: string, categoryIds: string[]) {
    await this.prisma.doctorCategory.deleteMany({ where: { doctorId } });
    if (categoryIds.length > 0) {
      await this.prisma.doctorCategory.createMany({
        data: categoryIds.map((categoryId) => ({ doctorId, categoryId })),
      });
    }
    return this.prisma.doctorCategory.findMany({
      where: { doctorId },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  // ─── BANK / UPI DETAILS ───────────────────────────

  async updatePaymentDetails(userId: string, data: {
    upiId?: string;
    bankAccountNo?: string;
    bankIfsc?: string;
    bankName?: string;
    accountHolderName?: string;
  }) {
    return this.prisma.doctor.update({
      where: { userId },
      data,
    });
  }

  async getPaymentDetails(userId: string) {
    const doctor = await this.getDoctorByUserId(userId);
    return {
      upiId: doctor.upiId,
      bankAccountNo: doctor.bankAccountNo,
      bankIfsc: doctor.bankIfsc,
      bankName: doctor.bankName,
      accountHolderName: doctor.accountHolderName,
    };
  }

  // ─── DOCTOR BOOKINGS BY DATE + EARNINGS ───────────

  async getBookingsByDate(userId: string, date?: string, range?: 'today' | 'yesterday' | 'tomorrow' | 'week') {
    const doctor = await this.getDoctorByUserId(userId);
    const commissionPercent = 30; // platform takes 30%

    let startDate: Date;
    let endDate: Date;

    if (date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      switch (range) {
        case 'yesterday':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'tomorrow':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() + 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - startDate.getDay()); // start of week
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        default: // today
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
      }
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        doctorId: doctor.id,
        scheduledAt: { gte: startDate, lte: endDate },
      },
      include: {
        patient: { select: { name: true } },
        forMember: { select: { name: true, relation: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Calculate earnings after commission
    const enrichedBookings = bookings.map((b) => {
      const gross = Number(b.amountCharged);
      const commission = gross * (commissionPercent / 100);
      const net = gross - commission;
      const actualDurationMin = b.startedAt && b.endedAt
        ? Math.round((b.endedAt.getTime() - b.startedAt.getTime()) / 60000)
        : null;
      return {
        ...b,
        grossAmount: gross,
        commissionDeducted: commission,
        netEarning: net,
        actualDurationMin,
        patientName: b.forMember?.name || b.patient.name || 'Patient',
      };
    });

    const totalGross = enrichedBookings.reduce((s, b) => s + b.grossAmount, 0);
    const totalNet = enrichedBookings.reduce((s, b) => s + b.netEarning, 0);

    return {
      bookings: enrichedBookings,
      summary: {
        totalBookings: bookings.length,
        completed: bookings.filter((b) => b.status === 'COMPLETED').length,
        totalGrossEarnings: totalGross,
        commissionDeducted: totalGross - totalNet,
        totalNetEarnings: totalNet,
        commissionPercent,
      },
    };
  }

  // ─── PAYOUT HISTORY ───────────────────────────────

  async getPayoutHistory(userId: string) {
    const doctor = await this.getDoctorByUserId(userId);
    return this.prisma.doctorPayout.findMany({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
