import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { DoctorsService } from '../doctors/doctors.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
    private doctorsService: DoctorsService,
    @InjectQueue('booking') private bookingQueue: Queue,
    @InjectQueue('refund') private refundQueue: Queue,
  ) {}

  async createBooking(patientUserId: string, dto: CreateBookingDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    let doctorId = dto.doctorId;

    // Instant mode: use matching engine if no doctor specified
    if (dto.mode === 'INSTANT' && !doctorId) {
      doctorId = await this.doctorsService.findAvailableDoctor(dto.specialization);
      if (!doctorId) {
        throw new BadRequestException('No doctors available right now');
      }
    }

    if (!doctorId) throw new BadRequestException('Doctor ID is required');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Check wallet balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: patientUserId },
    });
    if (!wallet || wallet.balance.lessThan(doctor.consultationFee)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const scheduledAt =
      dto.mode === 'INSTANT' ? new Date() : new Date(dto.scheduledAt!);
    const defaultDuration = this.config.get<number>(
      'DEFAULT_CONSULTATION_DURATION_MINUTES',
      15,
    );

    // For scheduled bookings: validate slot availability + check conflicts
    if (dto.mode === 'SCHEDULED') {
      if (scheduledAt <= new Date()) {
        throw new BadRequestException('Scheduled time must be in the future');
      }
      await this.doctorsService.validateSlotAvailability(doctorId, scheduledAt);
      await this.doctorsService.checkConflict(doctorId, scheduledAt, defaultDuration);
    }

    const livekitRoom = `room_${uuid()}`;

    // Create booking + debit wallet in a transaction
    const booking = await this.prisma.$transaction(async (tx) => {
      // Debit wallet
      await tx.wallet.update({
        where: { userId: patientUserId },
        data: { balance: { decrement: doctor.consultationFee } },
      });

      // Create immutable ledger entry
      await tx.transaction.create({
        data: {
          userId: patientUserId,
          amount: doctor.consultationFee,
          type: 'DEBIT',
          description: `Consultation with Dr. ${doctor.name}`,
        },
      });

      // Create booking
      return tx.booking.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          mode: dto.mode,
          status: dto.mode === 'INSTANT' ? 'CONFIRMED' : 'PENDING',
          scheduledAt,
          durationMin: defaultDuration,
          livekitRoom,
          amountCharged: doctor.consultationFee,
          symptoms: dto.symptoms,
          medications: dto.medications,
        },
        include: {
          doctor: { select: { name: true, specialization: true } },
        },
      });
    });

    // Schedule auto-cancel if doctor doesn't accept (instant only)
    if (dto.mode === 'INSTANT') {
      await this.bookingQueue.add(
        'auto-cancel',
        { bookingId: booking.id },
        { delay: 60000 }, // 60 seconds
      );
    }

    // Schedule no-show check for scheduled bookings
    if (dto.mode === 'SCHEDULED' && dto.scheduledAt) {
      const delay = scheduledAt.getTime() - Date.now() + 5 * 60 * 1000; // 5 min after scheduled time
      if (delay > 0) {
        await this.bookingQueue.add(
          'no-show-check',
          { bookingId: booking.id },
          { delay },
        );
      }
    }

    return booking;
  }

  async getBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: { select: { name: true, specialization: true, avatarUrl: true, userId: true } },
        patient: { select: { name: true, userId: true } },
        reports: true,
        prescription: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // Verify access: patient or doctor
    if (booking.patient.userId !== userId && booking.doctor.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }

  async reschedule(bookingId: string, userId: string, dto: RescheduleBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { patient: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.patient.userId !== userId) throw new ForbiddenException();
    if (booking.rescheduled) {
      throw new BadRequestException('Booking can only be rescheduled once');
    }

    // Check if <15 minutes remaining
    const timeLeft = booking.scheduledAt.getTime() - Date.now();
    if (timeLeft < 15 * 60 * 1000) {
      throw new BadRequestException(
        'Cannot reschedule within 15 minutes of the appointment',
      );
    }

    const newScheduledAt = new Date(dto.newScheduledAt);

    if (newScheduledAt <= new Date()) {
      throw new BadRequestException('New time must be in the future');
    }

    // Validate new time against doctor's slots and existing bookings
    await this.doctorsService.validateSlotAvailability(
      booking.doctorId,
      newScheduledAt,
    );
    await this.doctorsService.checkConflict(
      booking.doctorId,
      newScheduledAt,
      booking.durationMin,
      bookingId, // exclude current booking from conflict check
    );

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        scheduledAt: newScheduledAt,
        rescheduled: true,
      },
    });
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { patient: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.patient.userId !== userId) throw new ForbiddenException();
    if (['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancelReason: 'Cancelled by patient' },
    });

    // Trigger refund
    await this.refundQueue.add('process-refund', {
      bookingId: booking.id,
      userId: booking.patient.userId,
      amount: booking.amountCharged.toString(),
      reason: 'Booking cancelled by patient',
    });

    return { message: 'Booking cancelled. Refund initiated.' };
  }

  async extendSession(bookingId: string, doctorUserId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { doctor: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.doctor.userId !== doctorUserId) throw new ForbiddenException();
    if (booking.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is not in progress');
    }
    if (booking.extended) {
      throw new BadRequestException('Session already extended once');
    }

    // Check if doctor has upcoming booking in next slot
    const extensionMin = this.config.get<number>('EXTENSION_DURATION_MINUTES', 5);
    const extendedEndTime = new Date(
      booking.scheduledAt.getTime() +
        (booking.durationMin + extensionMin) * 60 * 1000,
    );

    const nextBooking = await this.prisma.booking.findFirst({
      where: {
        doctorId: booking.doctorId,
        id: { not: booking.id },
        status: { in: ['CONFIRMED', 'PENDING'] },
        scheduledAt: { lte: extendedEndTime },
      },
    });

    if (nextBooking) {
      throw new BadRequestException('Doctor has an upcoming booking');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        extended: true,
        durationMin: booking.durationMin + extensionMin,
      },
    });
  }

  // Doctor: get incoming/upcoming bookings
  async getDoctorBookings(doctorUserId: string, status?: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.booking.findMany({
      where: {
        doctorId: doctor.id,
        ...(status && { status: status as any }),
      },
      include: {
        patient: { select: { name: true } },
        reports: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // Doctor accepts a booking
  async acceptBooking(bookingId: string, doctorUserId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { doctor: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.doctor.userId !== doctorUserId) throw new ForbiddenException();
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking is not pending');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });
  }

  // Start session
  async startSession(bookingId: string, doctorUserId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { doctor: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.doctor.userId !== doctorUserId) throw new ForbiddenException();

    await this.redis.setActiveSession(booking.doctorId, booking.id);

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });

    // Schedule auto-end
    const delay = booking.durationMin * 60 * 1000;
    await this.bookingQueue.add(
      'session-end',
      { bookingId: booking.id },
      { delay },
    );

    return updated;
  }

  // End session
  async endSession(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { doctor: true, patient: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.doctor.userId !== userId && booking.patient.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.redis.clearActiveSession(booking.doctorId, booking.id);

    // Revenue split: 70% doctor, 30% platform
    const doctorShare = booking.amountCharged.mul(new Decimal(0.7));

    await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED', endedAt: new Date() },
      }),
      // Credit doctor wallet
      this.prisma.wallet.upsert({
        where: { userId: booking.doctor.userId },
        create: { userId: booking.doctor.userId, balance: doctorShare },
        update: { balance: { increment: doctorShare } },
      }),
      // Doctor earnings ledger entry
      this.prisma.transaction.create({
        data: {
          userId: booking.doctor.userId,
          bookingId: booking.id,
          amount: doctorShare,
          type: 'CREDIT',
          description: 'Consultation earnings (70%)',
        },
      }),
    ]);

    return { message: 'Session ended' };
  }
}
