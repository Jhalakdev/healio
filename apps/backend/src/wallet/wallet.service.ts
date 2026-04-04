import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

const MAX_WALLET_BALANCE = 25000; // ₹25,000 max

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return { ...wallet, maxBalance: MAX_WALLET_BALANCE };
  }

  async addMoney(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    if (amount > MAX_WALLET_BALANCE) {
      throw new BadRequestException(`Maximum single top-up is ₹${MAX_WALLET_BALANCE}`);
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    const currentBalance = wallet ? Number(wallet.balance) : 0;

    if (currentBalance + amount > MAX_WALLET_BALANCE) {
      const canAdd = MAX_WALLET_BALANCE - currentBalance;
      throw new BadRequestException(
        `Wallet limit is ₹${MAX_WALLET_BALANCE.toLocaleString('en-IN')}. You can add up to ₹${canAdd.toLocaleString('en-IN')} more.`,
      );
    }

    const decimalAmount = new Decimal(amount);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.upsert({
        where: { userId },
        create: { userId, balance: decimalAmount },
        update: { balance: { increment: decimalAmount } },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: decimalAmount,
          type: 'CREDIT',
          description: 'Wallet top-up',
        },
      });

      return { ...updated, maxBalance: MAX_WALLET_BALANCE };
    });
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          booking: { select: { id: true, scheduledAt: true } },
        },
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }
}
