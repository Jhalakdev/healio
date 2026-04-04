import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Processor('refund')
export class RefundProcessor extends WorkerHost {
  private readonly logger = new Logger(RefundProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { bookingId, userId, amount, reason } = job.data;

    await this.prisma.$transaction(async (tx) => {
      // Create refund transaction (immutable ledger entry)
      await tx.transaction.create({
        data: {
          userId,
          bookingId,
          amount: new Decimal(amount),
          type: 'REFUND',
          description: reason || 'Auto refund',
        },
      });

      // Credit wallet
      await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: new Decimal(amount) } },
      });
    });

    this.logger.log(
      `Refund of ${amount} processed for booking ${bookingId}`,
    );
  }
}
