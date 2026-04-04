import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReportType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private notifications: NotificationsService,
  ) {}

  async uploadReport(
    userId: string,
    bookingId: string | undefined,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // Check report upload window if linked to a booking
    let expiresAt: Date | undefined;
    if (bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { doctor: { select: { userId: true, name: true } } },
      });

      if (booking) {
        // Get configurable window (default 10 days)
        const config = await this.prisma.appConfig.findUnique({
          where: { key: 'report_upload_window_days' },
        });
        const windowDays = config ? Number(config.value) : 10;

        const deadline = new Date(booking.endedAt || booking.scheduledAt);
        deadline.setDate(deadline.getDate() + windowDays);

        if (new Date() > deadline) {
          throw new BadRequestException(
            `Report upload window has expired. You had ${windowDays} days after consultation to upload reports.`,
          );
        }

        expiresAt = deadline;
      }
    }

    const { key } = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'reports',
    );

    const fileType: ReportType = file.mimetype === 'application/pdf' ? 'PDF' : 'IMAGE';

    const report = await this.prisma.report.create({
      data: {
        patientId: patient.id,
        bookingId,
        fileUrl: key,
        fileName: file.originalname,
        fileType,
        uploadedBy: userId,
        expiresAt,
      },
    });

    // Notify the doctor that a report was uploaded
    if (bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { doctor: { select: { userId: true, name: true } } },
      });

      if (booking) {
        await this.notifications.create({
          userId: booking.doctor.userId,
          type: 'report',
          title: 'New Report Uploaded',
          body: `${patient.name || 'A patient'} uploaded a report: ${file.originalname}. Please review and respond within 24 hours.`,
          data: { bookingId, reportId: report.id },
        });
      }
    }

    return report;
  }

  // Get reports with remaining days info
  async getReports(userId: string, bookingId?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const reports = await this.prisma.report.findMany({
      where: {
        patientId: patient.id,
        ...(bookingId && { bookingId }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      reports.map(async (report) => {
        const daysLeft = report.expiresAt
          ? Math.max(0, Math.ceil((report.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null;

        return {
          ...report,
          fileUrl: await this.storage.getSignedUrl(report.fileUrl),
          doctorVoiceUrl: report.doctorVoiceUrl
            ? await this.storage.getSignedUrl(report.doctorVoiceUrl)
            : null,
          daysLeftToUpload: daysLeft,
          hasDoctoReply: !!(report.doctorReply || report.doctorVoiceUrl),
        };
      }),
    );
  }

  // Get report upload window info for a booking
  async getUploadWindow(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const config = await this.prisma.appConfig.findUnique({
      where: { key: 'report_upload_window_days' },
    });
    const windowDays = config ? Number(config.value) : 10;

    const deadline = new Date(booking.endedAt || booking.scheduledAt);
    deadline.setDate(deadline.getDate() + windowDays);

    const daysLeft = Math.max(
      0,
      Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );

    return {
      windowDays,
      deadline,
      daysLeft,
      canUpload: daysLeft > 0,
    };
  }

  // ─── DOCTOR REPLY TO REPORT (text or voice) ────────

  async doctorReplyText(doctorUserId: string, reportId: string, reply: string) {
    const report = await this.getReportForDoctor(doctorUserId, reportId);

    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        doctorReply: reply,
        doctorRepliedAt: new Date(),
        doctorId: doctorUserId,
      },
    });
  }

  async doctorReplyVoice(
    doctorUserId: string,
    reportId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const report = await this.getReportForDoctor(doctorUserId, reportId);

    const { key } = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'report-voice-replies',
    );

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        doctorVoiceUrl: key,
        doctorRepliedAt: new Date(),
        doctorId: doctorUserId,
      },
    });

    // Notify patient that doctor replied
    const patient = await this.prisma.patient.findUnique({
      where: { id: report.patientId },
    });
    if (patient) {
      await this.notifications.create({
        userId: patient.userId,
        type: 'report',
        title: 'Doctor Replied to Your Report',
        body: 'Your doctor has reviewed your report and sent a voice note reply.',
        data: { reportId },
      });
    }

    return updated;
  }

  // Doctor views reports for their bookings
  async getDoctorReports(doctorUserId: string, bookingId?: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const reports = await this.prisma.report.findMany({
      where: {
        booking: { doctorId: doctor.id },
        ...(bookingId && { bookingId }),
      },
      include: {
        patient: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      reports.map(async (report) => ({
        ...report,
        fileUrl: await this.storage.getSignedUrl(report.fileUrl),
        doctorVoiceUrl: report.doctorVoiceUrl
          ? await this.storage.getSignedUrl(report.doctorVoiceUrl)
          : null,
        needsReply: !report.doctorRepliedAt,
      })),
    );
  }

  // Helper: verify doctor has access to this report
  private async getReportForDoctor(doctorUserId: string, reportId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        booking: { include: { doctor: { select: { userId: true } } } },
      },
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.booking?.doctor?.userId !== doctorUserId) {
      throw new ForbiddenException('Not your patient\'s report');
    }

    return report;
  }

  async getSignedUrl(reportId: string, userId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        patient: { select: { userId: true } },
        booking: { include: { doctor: { select: { userId: true } } } },
      },
    });

    if (!report) throw new NotFoundException('Report not found');

    const isPatient = report.patient.userId === userId;
    const isDoctor = report.booking?.doctor?.userId === userId;
    if (!isPatient && !isDoctor) throw new ForbiddenException();

    return { url: await this.storage.getSignedUrl(report.fileUrl) };
  }
}
