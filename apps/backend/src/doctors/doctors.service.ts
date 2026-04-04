import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateDoctorProfileDto } from './dto/update-doctor.dto';
import { ListDoctorsDto } from './dto/list-doctors.dto';

@Injectable()
export class DoctorsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async listDoctors(query: ListDoctorsDto) {
    const onlineDoctorIds = await this.redis.getOnlineDoctors();

    const doctors = await this.prisma.doctor.findMany({
      where: {
        verificationStatus: 'APPROVED',
        ...(query.specialization && { specialization: query.specialization }),
        ...(query.onlineOnly && { id: { in: onlineDoctorIds } }),
      },
      select: {
        id: true,
        name: true,
        specialization: true,
        experience: true,
        consultationFee: true,
        avatarUrl: true,
        isOnline: true,
        lastSeenAt: true,
      },
      orderBy: { name: 'asc' },
    });

    // Enrich with real-time online status from Redis
    return doctors.map((doc) => ({
      ...doc,
      isOnline: onlineDoctorIds.includes(doc.id),
    }));
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
    return this.prisma.doctor.update({
      where: { userId },
      data: dto,
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
}
