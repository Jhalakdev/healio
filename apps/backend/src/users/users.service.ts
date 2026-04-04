import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePatientProfileDto } from './dto/update-patient.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getPatientProfile(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: { user: { select: { phone: true, email: true, role: true, createdAt: true } } },
    });

    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async updatePatientProfile(userId: string, dto: UpdatePatientProfileDto) {
    return this.prisma.patient.update({
      where: { userId },
      data: {
        name: dto.name,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
      },
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
}
