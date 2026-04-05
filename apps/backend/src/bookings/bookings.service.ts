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
import { PlansService } from '../plans/plans.service';
import { NotificationsService } from '../notifications/notifications.service';
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
    private plansService: PlansService,
    @InjectQueue('booking') private bookingQueue: Queue,
    @InjectQueue('refund') private refundQueue: Queue,
    private notificationsService: NotificationsService,
  ) {}

  async createBooking(patientUserId: string, dto: CreateBookingDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    let doctorId: string | undefined = dto.doctorId;

    // Instant mode: use matching engine if no doctor specified
    if (dto.mode === 'INSTANT' && !doctorId) {
      doctorId = (await this.doctorsService.findAvailableDoctor(dto.specialization)) || undefined;
      if (!doctorId) {
        throw new BadRequestException('No doctors available right now');
      }
    }

    if (!doctorId) throw new BadRequestException('Doctor ID is required');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

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

    // ─── PAYMENT LOGIC: Plan / Coupon / Wallet ────────
    let amountToCharge = doctor.consultationFee;
    let discount = new Decimal(0);
    let couponCode: string | null = null;
    let paidViaPlan = false;

    // Option 1: Use active plan (free consultation)
    if (dto.usePlan) {
      const planUsed = await this.plansService.useConsultation(patient.id, patientUserId);
      if (!planUsed) {
        throw new BadRequestException(
          'No active plan with remaining consultations. Purchase a plan or pay via wallet.',
        );
      }
      paidViaPlan = true;
      amountToCharge = new Decimal(0);
    }

    // Option 2: Apply coupon code (only if not using plan)
    if (!paidViaPlan && dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        throw new BadRequestException('Invalid coupon code');
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new BadRequestException('Coupon has expired');
      }
      if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
        throw new BadRequestException('Coupon usage limit reached');
      }

      // Calculate discount
      if (coupon.discountType === 'flat') {
        discount = coupon.discountValue;
      } else {
        // percentage
        discount = amountToCharge.mul(coupon.discountValue).div(100);
      }

      // Don't let discount exceed fee
      if (discount.greaterThan(amountToCharge)) {
        discount = amountToCharge;
      }

      amountToCharge = amountToCharge.sub(discount);
      couponCode = coupon.code;

      // Increment coupon usage
      await this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Option 3: Child discount (10% off flat rate, only for children)
    if (!paidViaPlan && dto.forMemberId) {
      const member = await this.prisma.familyMember.findUnique({
        where: { id: dto.forMemberId },
      });
      if (member && member.isChild) {
        const childDiscountConfig = await this.prisma.appConfig.findUnique({ where: { key: 'child_discount_percent' } });
        const childDiscountPct = childDiscountConfig?.value ? Number(childDiscountConfig.value) : 10;
        const childDiscount = amountToCharge.mul(new Decimal(childDiscountPct / 100));
        discount = discount.add(childDiscount);
        amountToCharge = amountToCharge.sub(childDiscount);
        if (amountToCharge.lessThan(0)) amountToCharge = new Decimal(0);
      }
    }

    // Check wallet balance (if paying via wallet)
    if (!paidViaPlan && amountToCharge.greaterThan(0)) {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId: patientUserId },
      });
      if (!wallet || wallet.balance.lessThan(amountToCharge)) {
        throw new BadRequestException(
          'Insufficient wallet balance. Please add money or purchase a plan.',
        );
      }
    }

    const livekitRoom = `room_${uuid()}`;

    // Create booking + debit wallet in a transaction
    const booking = await this.prisma.$transaction(async (tx) => {
      // Debit wallet (only if not plan and amount > 0)
      if (!paidViaPlan && amountToCharge.greaterThan(0)) {
        await tx.wallet.update({
          where: { userId: patientUserId },
          data: { balance: { decrement: amountToCharge } },
        });

        // Create immutable ledger entry
        await tx.transaction.create({
          data: {
            userId: patientUserId,
            amount: amountToCharge,
            type: 'DEBIT',
            description: `Consultation with Dr. ${doctor.name}${couponCode ? ` (coupon: ${couponCode})` : ''}`,
          },
        });
      }

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
          amountCharged: paidViaPlan ? doctor.consultationFee : amountToCharge,
          symptoms: dto.symptoms,
          medications: dto.medications,
          couponCode,
          discount,
          paidViaPlan,
          forMemberId: dto.forMemberId || null,
        },
        include: {
          doctor: { select: { name: true, specialization: true } },
          forMember: dto.forMemberId ? { select: { name: true, relation: true } } : false,
        },
      });
    });

    // Notify doctor about new booking
    try {
      const doctorUserId = (await this.prisma.doctor.findUnique({ where: { id: booking.doctorId }, select: { userId: true } }))?.userId;
      if (doctorUserId) {
        await this.notificationsService.create({
          userId: doctorUserId,
          type: 'booking',
          title: 'New Booking!',
          body: `${patient.name || 'A patient'} has booked a consultation${dto.scheduledAt ? ` for ${new Date(dto.scheduledAt).toLocaleString('en-IN')}` : ''}`,
          data: { bookingId: booking.id },
        });
      }
    } catch {}

    // Schedule auto-cancel if doctor doesn't accept (instant only)
    if (dto.mode === 'INSTANT') {
      await this.bookingQueue.add(
        'auto-cancel',
        { bookingId: booking.id },
        { delay: this.config.get<number>('AUTO_CANCEL_DELAY_MS', 60000) },
      );
    }

    // Schedule no-show check for scheduled bookings
    if (dto.mode === 'SCHEDULED' && dto.scheduledAt) {
      const noShowDelayMin = this.config.get<number>('NO_SHOW_CHECK_DELAY_MIN', 5);
      const delay = scheduledAt.getTime() - Date.now() + noShowDelayMin * 60 * 1000;
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

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    // Track doctor response time (time from booking creation to acceptance)
    const responseMin = Math.round(
      (Date.now() - booking.createdAt.getTime()) / 60000,
    );
    // Update rolling average response time
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: booking.doctorId },
    });
    if (doctor) {
      const currentAvg = doctor.avgResponseMin || responseMin;
      const newAvg = Math.round((currentAvg + responseMin) / 2);
      await this.prisma.doctor.update({
        where: { id: doctor.id },
        data: { avgResponseMin: newAvg },
      });
    }

    return updated;
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

    // Revenue split: configurable doctor/platform share
    const commConfig = await this.prisma.appConfig.findUnique({ where: { key: 'platform_commission_percent' } });
    const platformPercent = commConfig?.value ? Number(commConfig.value) : 30;
    const doctorShare = booking.amountCharged.mul(new Decimal((100 - platformPercent) / 100));

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
          description: `Consultation earnings (${100 - platformPercent}%)`,
        },
      }),
    ]);

    return { message: 'Session ended' };
  }
}
