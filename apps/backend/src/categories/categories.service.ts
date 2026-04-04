import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Public: list active categories (for app + doctor registration)
  async listActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { doctors: true } },
      },
    });
  }

  // Admin: list all categories (including inactive)
  async listAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { doctors: true } },
      },
    });
  }

  // Admin: create category
  async create(data: {
    name: string;
    icon?: string;
    imageUrl?: string;
    sortOrder?: number;
  }) {
    return this.prisma.category.create({ data });
  }

  // Admin: update category
  async update(id: string, data: {
    name?: string;
    icon?: string;
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  // Admin: delete (soft delete)
  async delete(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
