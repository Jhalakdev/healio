import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ─── SPECIALISTS (categories) ─────────────────────

  async listActiveSpecialists() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { doctors: true, symptoms: true } } },
    });
  }

  async listAllSpecialists() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { doctors: true, symptoms: true } } },
    });
  }

  async createSpecialist(data: { name: string; icon?: string; imageUrl?: string; sortOrder?: number }) {
    return this.prisma.category.create({ data });
  }

  async updateSpecialist(id: string, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteSpecialist(id: string) {
    return this.prisma.category.update({ where: { id }, data: { isActive: false } });
  }

  // ─── SYMPTOMS / DISEASES ──────────────────────────

  async listActiveSymptoms() {
    return this.prisma.symptom.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        specialists: {
          include: { category: { select: { id: true, name: true, icon: true } } },
        },
      },
    });
  }

  async listAllSymptoms() {
    return this.prisma.symptom.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        specialists: {
          include: { category: { select: { id: true, name: true } } },
        },
        _count: { select: { specialists: true } },
      },
    });
  }

  async createSymptom(data: {
    name: string;
    description?: string;
    icon?: string;
    imageUrl?: string;
    specialistIds?: string[];
  }) {
    const symptom = await this.prisma.symptom.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        imageUrl: data.imageUrl,
      },
    });

    // Link to specialists
    if (data.specialistIds?.length) {
      await this.prisma.symptomSpecialist.createMany({
        data: data.specialistIds.map((categoryId) => ({
          symptomId: symptom.id,
          categoryId,
        })),
      });
    }

    return this.prisma.symptom.findUnique({
      where: { id: symptom.id },
      include: { specialists: { include: { category: { select: { name: true } } } } },
    });
  }

  async updateSymptom(id: string, data: any) {
    // If specialistIds provided, replace links
    if (data.specialistIds) {
      await this.prisma.symptomSpecialist.deleteMany({ where: { symptomId: id } });
      if (data.specialistIds.length > 0) {
        await this.prisma.symptomSpecialist.createMany({
          data: data.specialistIds.map((categoryId: string) => ({ symptomId: id, categoryId })),
        });
      }
      delete data.specialistIds;
    }
    return this.prisma.symptom.update({ where: { id }, data });
  }

  async deleteSymptom(id: string) {
    return this.prisma.symptom.update({ where: { id }, data: { isActive: false } });
  }

  // Find doctors by symptom (via linked specialists)
  async findDoctorsBySymptom(symptomId: string) {
    const links = await this.prisma.symptomSpecialist.findMany({
      where: { symptomId },
      select: { categoryId: true },
    });
    const categoryIds = links.map((l) => l.categoryId);

    return this.prisma.doctor.findMany({
      where: {
        verificationStatus: 'APPROVED',
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      include: {
        categories: { include: { category: { select: { name: true } } } },
      },
    });
  }
}
