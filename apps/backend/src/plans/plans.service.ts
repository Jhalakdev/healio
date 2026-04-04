import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  // List active plans (public)
  async listPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  // Patient purchases a plan
  async purchasePlan(userId: string, planId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });
    if (!plan || !plan.isActive) throw new NotFoundException('Plan not found');

    // Check wallet balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet || wallet.balance.lessThan(plan.price)) {
      throw new BadRequestException(
        'Insufficient wallet balance. Please add money first.',
      );
    }

    // Check if patient already has an active plan
    const existingPlan = await this.prisma.patientPlan.findFirst({
      where: {
        patientId: patient.id,
        isActive: true,
        consultationsRemaining: { gt: 0 },
        expiresAt: { gt: new Date() },
      },
    });
    if (existingPlan) {
      throw new BadRequestException(
        `You already have an active plan with ${existingPlan.consultationsRemaining} consultations remaining`,
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.validityDays);

    return this.prisma.$transaction(async (tx) => {
      // Debit wallet
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: plan.price } },
      });

      // Ledger entry
      await tx.transaction.create({
        data: {
          userId,
          amount: plan.price,
          type: 'DEBIT',
          description: `Plan purchase: ${plan.name}`,
          metadata: { planId: plan.id, planName: plan.name },
        },
      });

      // Create patient plan subscription
      return tx.patientPlan.create({
        data: {
          patientId: patient.id,
          planId: plan.id,
          consultationsRemaining: plan.consultations,
          expiresAt,
        },
        include: { plan: true },
      });
    });
  }

  // Get patient's active plan
  async getActivePlan(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.patientPlan.findFirst({
      where: {
        patientId: patient.id,
        isActive: true,
        consultationsRemaining: { gt: 0 },
        expiresAt: { gt: new Date() },
      },
      include: { plan: true },
    });
  }

  // Get patient's plan history
  async getPlanHistory(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.patientPlan.findMany({
      where: { patientId: patient.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Use one consultation from active plan (called during booking)
  async useConsultation(patientId: string): Promise<boolean> {
    const activePlan = await this.prisma.patientPlan.findFirst({
      where: {
        patientId,
        isActive: true,
        consultationsRemaining: { gt: 0 },
        expiresAt: { gt: new Date() },
      },
    });

    if (!activePlan) return false;

    await this.prisma.patientPlan.update({
      where: { id: activePlan.id },
      data: {
        consultationsRemaining: { decrement: 1 },
        consultationsUsed: { increment: 1 },
      },
    });

    // Deactivate if no consultations remaining
    if (activePlan.consultationsRemaining <= 1) {
      await this.prisma.patientPlan.update({
        where: { id: activePlan.id },
        data: { isActive: false },
      });
    }

    return true;
  }
}
