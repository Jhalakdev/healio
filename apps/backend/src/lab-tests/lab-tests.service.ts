import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LabTestsService {
  constructor(private prisma: PrismaService) {}

  // ─── PUBLIC: Browse tests ─────────────────────────

  async listTests(category?: string, search?: string) {
    return this.prisma.labTest.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { category: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      },
      include: { provider: { select: { name: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getTest(id: string) {
    return this.prisma.labTest.findUnique({
      where: { id },
      include: { provider: { select: { name: true } } },
    });
  }

  async getCategories() {
    const tests = await this.prisma.labTest.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return tests.map(t => t.category);
  }

  async getPopularPackages() {
    return this.prisma.labTest.findMany({
      where: { isActive: true, isPackage: true },
      include: { provider: { select: { name: true } } },
      orderBy: { sortOrder: 'asc' },
      take: 10,
    });
  }

  // ─── PATIENT: Place order ─────────────────────────

  async createOrder(
    userId: string,
    data: {
      testIds: string[];
      forMemberId?: string;
      collectionDate: string;
      collectionTime: string;
      collectionAddress: string;
      collectionCity: string;
      collectionPincode: string;
      patientName: string;
      patientAge?: number;
      patientGender?: string;
      patientPhone: string;
      couponCode?: string;
      notes?: string;
    },
  ) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    // Get all tests
    const tests = await this.prisma.labTest.findMany({
      where: { id: { in: data.testIds }, isActive: true },
      include: { provider: true },
    });
    if (tests.length === 0) throw new BadRequestException('No valid tests selected');

    // All tests must be from same provider
    const providerIds = [...new Set(tests.map(t => t.providerId))];
    if (providerIds.length > 1) throw new BadRequestException('All tests must be from the same lab');

    const totalMrp = tests.reduce((s, t) => s + Number(t.mrp), 0);
    const totalAmount = tests.reduce((s, t) => s + Number(t.sellingPrice), 0);
    const totalCost = tests.reduce((s, t) => s + Number(t.costPrice), 0);
    const profit = totalAmount - totalCost;

    // Check wallet
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.balance) < totalAmount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Create order + debit wallet
    return this.prisma.$transaction(async (tx) => {
      // Debit wallet
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: new Decimal(totalAmount) } },
      });

      // Ledger entry
      await tx.transaction.create({
        data: {
          userId,
          amount: new Decimal(totalAmount),
          type: 'DEBIT',
          description: `Lab test: ${tests.map(t => t.name).join(', ')}`,
        },
      });

      // Create order
      const order = await tx.labOrder.create({
        data: {
          patientId: patient.id,
          providerId: providerIds[0],
          forMemberId: data.forMemberId,
          totalMrp: new Decimal(totalMrp),
          totalAmount: new Decimal(totalAmount),
          totalCostPrice: new Decimal(totalCost),
          profit: new Decimal(profit),
          patientName: data.patientName,
          patientAge: data.patientAge,
          patientGender: data.patientGender,
          patientPhone: data.patientPhone,
          collectionDate: new Date(data.collectionDate),
          collectionTime: data.collectionTime,
          collectionAddress: data.collectionAddress,
          collectionCity: data.collectionCity,
          collectionPincode: data.collectionPincode,
          couponCode: data.couponCode,
          notes: data.notes,
          status: 'confirmed',
          items: {
            create: tests.map(t => ({
              testId: t.id,
              testName: t.name,
              price: t.sellingPrice,
              costPrice: t.costPrice,
            })),
          },
        },
        include: { items: true, provider: { select: { name: true } } },
      });

      return order;
    });
  }

  // Doctor orders test for patient
  async doctorOrderTest(
    doctorUserId: string,
    data: {
      patientId: string;
      testIds: string[];
      bookingId?: string;
      notes?: string;
    },
  ) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const patient = await this.prisma.patient.findUnique({
      where: { id: data.patientId },
      include: { user: { select: { phone: true } } },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const tests = await this.prisma.labTest.findMany({
      where: { id: { in: data.testIds }, isActive: true },
    });
    if (tests.length === 0) throw new BadRequestException('No valid tests');

    const providerIds = [...new Set(tests.map(t => t.providerId))];
    const totalMrp = tests.reduce((s, t) => s + Number(t.mrp), 0);
    const totalAmount = tests.reduce((s, t) => s + Number(t.sellingPrice), 0);
    const totalCost = tests.reduce((s, t) => s + Number(t.costPrice), 0);

    // Create pending order (patient pays later)
    const order = await this.prisma.labOrder.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        providerId: providerIds[0],
        bookingId: data.bookingId,
        totalMrp: new Decimal(totalMrp),
        totalAmount: new Decimal(totalAmount),
        totalCostPrice: new Decimal(totalCost),
        profit: new Decimal(totalAmount - totalCost),
        patientName: patient.name || 'Patient',
        patientPhone: patient.user?.phone || '',
        notes: data.notes || `Ordered by Dr. ${doctor.name}`,
        status: 'pending', // patient needs to confirm + pay + add address
        items: {
          create: tests.map(t => ({
            testId: t.id,
            testName: t.name,
            price: t.sellingPrice,
            costPrice: t.costPrice,
          })),
        },
      },
      include: { items: true },
    });

    // Notify patient
    await this.prisma.notification.create({
      data: {
        userId: patient.userId,
        type: 'lab_test',
        title: 'Doctor Ordered Lab Tests',
        body: `Dr. ${doctor.name} has ordered ${tests.map(t => t.name).join(', ')} for you. Please confirm and schedule collection.`,
        data: { orderId: order.id },
      },
    });

    return order;
  }

  // ─── PATIENT: My orders ───────────────────────────

  async getMyOrders(userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.labOrder.findMany({
      where: { patientId: patient.id },
      include: {
        items: true,
        reports: true,
        provider: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(orderId: string) {
    return this.prisma.labOrder.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { test: true } },
        reports: true,
        provider: { select: { name: true } },
      },
    });
  }

  // ─── STATUS UPDATE (webhook from provider or admin) ──

  async updateOrderStatus(orderId: string, status: string, extra?: any) {
    const data: any = { status };
    if (status === 'sample_collected') data.sampleCollectedAt = new Date();
    if (status === 'report_ready') data.reportReadyAt = new Date();
    if (extra?.phlebotomistName) data.phlebotomistName = extra.phlebotomistName;
    if (extra?.phlebotomistPhone) data.phlebotomistPhone = extra.phlebotomistPhone;
    if (extra?.providerOrderId) data.providerOrderId = extra.providerOrderId;

    const order = await this.prisma.labOrder.update({
      where: { id: orderId },
      data,
      include: { patient: true },
    });

    // Notify patient on status changes
    const statusMessages: Record<string, string> = {
      confirmed: 'Your lab test order has been confirmed.',
      sample_collected: 'Blood sample collected successfully. Results coming soon.',
      processing: 'Your samples are being processed in the lab.',
      report_ready: 'Your lab report is ready! Check your reports section.',
      delivered: 'Lab report has been delivered to your profile.',
      cancelled: 'Your lab test order has been cancelled.',
    };

    if (statusMessages[status] && order.patient) {
      await this.prisma.notification.create({
        data: {
          userId: order.patient.userId,
          type: 'lab_test',
          title: `Lab Test: ${status.replace('_', ' ').toUpperCase()}`,
          body: statusMessages[status],
          data: { orderId },
        },
      });
    }

    return order;
  }

  // ─── ADMIN ────────────────────────────────────────

  async adminListOrders(status?: string, page = 1, limit = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where = status ? { status } : undefined;

    const [orders, total] = await Promise.all([
      this.prisma.labOrder.findMany({
        where,
        include: {
          items: true,
          reports: true,
          provider: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
      this.prisma.labOrder.count({ where }),
    ]);

    return { data: orders, meta: { total, page: p, limit: l } };
  }

  async adminDashboard() {
    const [totalOrders, totalRevenue, totalCost, pendingOrders, reportsReady] = await Promise.all([
      this.prisma.labOrder.count(),
      this.prisma.labOrder.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.labOrder.aggregate({ _sum: { totalCostPrice: true } }),
      this.prisma.labOrder.count({ where: { status: { in: ['pending', 'confirmed'] } } }),
      this.prisma.labOrder.count({ where: { status: 'report_ready' } }),
    ]);

    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    const cost = Number(totalCost._sum.totalCostPrice || 0);

    return {
      totalOrders,
      totalRevenue: revenue,
      totalCost: cost,
      totalProfit: revenue - cost,
      pendingOrders,
      reportsReady,
    };
  }

  // Admin: manage tests
  async adminCreateTest(data: any) {
    return this.prisma.labTest.create({ data: {
      ...data,
      mrp: new Decimal(data.mrp),
      sellingPrice: new Decimal(data.sellingPrice),
      costPrice: new Decimal(data.costPrice),
    }});
  }

  async adminUpdateTest(id: string, data: any) {
    const update: any = { ...data };
    if (data.mrp) update.mrp = new Decimal(data.mrp);
    if (data.sellingPrice) update.sellingPrice = new Decimal(data.sellingPrice);
    if (data.costPrice) update.costPrice = new Decimal(data.costPrice);
    return this.prisma.labTest.update({ where: { id }, data: update });
  }

  // Admin: manage providers
  async adminListProviders() {
    return this.prisma.labProvider.findMany({
      include: { _count: { select: { tests: true, orders: true } } },
    });
  }

  async adminCreateProvider(data: any) {
    return this.prisma.labProvider.create({ data });
  }

  async adminUpdateProvider(id: string, data: any) {
    return this.prisma.labProvider.update({ where: { id }, data });
  }

  // Admin: upload report for an order
  async adminUploadReport(orderId: string, fileName: string, fileUrl: string) {
    await this.prisma.labReport.create({
      data: { orderId, fileName, fileUrl },
    });
    // Update order status
    return this.updateOrderStatus(orderId, 'report_ready');
  }
}
