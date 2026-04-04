import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // Doctor creates a text prescription (auto-generates PDF later)
  async createPrescription(
    doctorUserId: string,
    bookingId: string,
    data: { content?: string; notes?: string },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { doctor: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.doctor.userId !== doctorUserId) {
      throw new ForbiddenException('Only the assigned doctor can write prescriptions');
    }

    // Check if prescription already exists
    const existing = await this.prisma.prescription.findUnique({
      where: { bookingId },
    });
    if (existing) {
      // Update existing
      return this.prisma.prescription.update({
        where: { bookingId },
        data: {
          content: data.content,
          notes: data.notes,
        },
      });
    }

    return this.prisma.prescription.create({
      data: {
        bookingId,
        content: data.content,
        notes: data.notes,
      },
    });
  }

  // Doctor uploads a handwritten/scanned prescription file
  async uploadPrescriptionFile(
    doctorUserId: string,
    bookingId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { doctor: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.doctor.userId !== doctorUserId) {
      throw new ForbiddenException('Only the assigned doctor can upload prescriptions');
    }

    const { key } = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'prescriptions',
    );

    // Upsert prescription
    return this.prisma.prescription.upsert({
      where: { bookingId },
      create: { bookingId, fileUrl: key },
      update: { fileUrl: key },
    });
  }

  // Doctor uploads voice note for a prescription
  async uploadVoiceNote(
    doctorUserId: string,
    bookingId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { doctor: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.doctor.userId !== doctorUserId) {
      throw new ForbiddenException();
    }

    const { key } = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'voice-notes',
    );

    return this.prisma.prescription.upsert({
      where: { bookingId },
      create: { bookingId, voiceUrl: key },
      update: { voiceUrl: key },
    });
  }

  // Patient or doctor can view prescription
  async getPrescription(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: { select: { userId: true } },
        patient: { select: { userId: true } },
        prescription: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.doctor.userId !== userId && booking.patient.userId !== userId) {
      throw new ForbiddenException();
    }

    if (!booking.prescription) {
      throw new NotFoundException('No prescription yet');
    }

    // Generate signed URLs for files
    const prescription = booking.prescription;
    return {
      ...prescription,
      fileUrl: prescription.fileUrl
        ? await this.storage.getSignedUrl(prescription.fileUrl)
        : null,
      voiceUrl: prescription.voiceUrl
        ? await this.storage.getSignedUrl(prescription.voiceUrl)
        : null,
    };
  }
}
