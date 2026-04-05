import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

const DEFAULT_MAX_WALLET = 25000;

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  private async getMaxBalance(): Promise<number> {
    const config = await this.prisma.appConfig.findUnique({ where: { key: 'max_wallet_balance' } });
    return config?.value ? Number(config.value) : DEFAULT_MAX_WALLET;
  }

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    const maxBalance = await this.getMaxBalance();
    return { ...wallet, maxBalance };
  }

  async addMoney(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    const maxBalance = await this.getMaxBalance();

    if (amount > maxBalance) {
      throw new BadRequestException(`Maximum single top-up is ₹${maxBalance}`);
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    const currentBalance = wallet ? Number(wallet.balance) : 0;

    if (currentBalance + amount > maxBalance) {
      const canAdd = maxBalance - currentBalance;
      throw new BadRequestException(
        `Wallet limit is ₹${maxBalance.toLocaleString('en-IN')}. You can add up to ₹${canAdd.toLocaleString('en-IN')} more.`,
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

      return { ...updated, maxBalance };
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
