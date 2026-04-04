import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpayKeyId: string;
  private razorpayKeySecret: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.razorpayKeyId = config.get<string>('RAZORPAY_KEY_ID', '');
    this.razorpayKeySecret = config.get<string>('RAZORPAY_KEY_SECRET', '');
  }

  // Create Razorpay order for wallet top-up
  async createWalletTopupOrder(userId: string, amount: number) {
    if (amount < 1) throw new BadRequestException('Minimum amount is ₹1');

    // Create Razorpay order via API
    const razorpayOrder = await this.createRazorpayOrder(amount);

    // Store order in DB
    await this.prisma.razorpayOrder.create({
      data: {
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount: new Decimal(amount),
        purpose: 'wallet_topup',
      },
    });

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: this.razorpayKeyId,
    };
  }

  // Create Razorpay order for plan purchase
  async createPlanPurchaseOrder(userId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) throw new NotFoundException('Plan not found');

    const razorpayOrder = await this.createRazorpayOrder(
      Number(plan.price),
    );

    await this.prisma.razorpayOrder.create({
      data: {
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount: plan.price,
        purpose: 'plan_purchase',
        metadata: { planId },
      },
    });

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: this.razorpayKeyId,
    };
  }

  // Verify payment callback from Razorpay
  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', this.razorpayKeySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== data.razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Find order
    const order = await this.prisma.razorpayOrder.findUnique({
      where: { razorpayOrderId: data.razorpay_order_id },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'paid') {
      return { message: 'Payment already processed' };
    }

    // Update order status
    await this.prisma.razorpayOrder.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        razorpayPaymentId: data.razorpay_payment_id,
      },
    });

    // Process based on purpose
    if (order.purpose === 'wallet_topup') {
      await this.processWalletTopup(order.userId, Number(order.amount));
    } else if (order.purpose === 'plan_purchase') {
      const metadata = order.metadata as any;
      await this.processPlanPurchase(
        order.userId,
        metadata.planId,
        order.id,
      );
    }

    return { message: 'Payment verified and processed' };
  }

  // ─── Internal ─────────────────────────────────────

  private async processWalletTopup(userId: string, amount: number) {
    await this.prisma.$transaction(async (tx) => {
      await tx.wallet.upsert({
        where: { userId },
        create: { userId, balance: new Decimal(amount) },
        update: { balance: { increment: new Decimal(amount) } },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: new Decimal(amount),
          type: 'CREDIT',
          description: 'Wallet top-up via Razorpay',
        },
      });
    });
  }

  private async processPlanPurchase(
    userId: string,
    planId: string,
    razorpayOrderId: string,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) return;

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });
    if (!plan) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.validityDays);

    await this.prisma.$transaction(async (tx) => {
      await tx.patientPlan.create({
        data: {
          patientId: patient.id,
          planId: plan.id,
          consultationsRemaining: plan.consultations,
          expiresAt,
          razorpayOrderId,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: plan.price,
          type: 'DEBIT',
          description: `Plan purchase: ${plan.name} (via Razorpay)`,
          metadata: { planId, planName: plan.name },
        },
      });
    });
  }

  private async createRazorpayOrder(
    amount: number,
  ): Promise<{ id: string; amount: number; currency: string }> {
    // If Razorpay keys not configured, return mock order (dev mode)
    if (!this.razorpayKeyId || !this.razorpayKeySecret) {
      return {
        id: `order_dev_${Date.now()}`,
        amount: amount * 100, // paise
        currency: 'INR',
      };
    }

    const auth = Buffer.from(
      `${this.razorpayKeyId}:${this.razorpayKeySecret}`,
    ).toString('base64');

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay uses paise
        currency: 'INR',
      }),
    });

    if (!res.ok) {
      throw new BadRequestException('Failed to create Razorpay order');
    }

    return res.json();
  }

  // Get payment history for a user
  async getPaymentHistory(userId: string) {
    return this.prisma.razorpayOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
