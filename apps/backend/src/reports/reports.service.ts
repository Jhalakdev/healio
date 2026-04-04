import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ReportType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
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

    const { key, url } = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'reports',
    );

    const fileType: ReportType = file.mimetype === 'application/pdf' ? 'PDF' : 'IMAGE';

    return this.prisma.report.create({
      data: {
        patientId: patient.id,
        bookingId,
        fileUrl: key,
        fileName: file.originalname,
        fileType,
        uploadedBy: userId,
      },
    });
  }

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

    // Generate signed URLs
    return Promise.all(
      reports.map(async (report) => ({
        ...report,
        fileUrl: await this.storage.getSignedUrl(report.fileUrl),
      })),
    );
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

    // Access control: only patient or their doctor
    const isPatient = report.patient.userId === userId;
    const isDoctor = report.booking?.doctor?.userId === userId;
    if (!isPatient && !isDoctor) throw new ForbiddenException();

    return { url: await this.storage.getSignedUrl(report.fileUrl) };
  }
}
