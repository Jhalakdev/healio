import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('booking')
export class BookingProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'auto-cancel':
        await this.handleAutoCancel(job.data);
        break;
      case 'session-end':
        await this.handleSessionEnd(job.data);
        break;
      case 'no-show-check':
        await this.handleNoShowCheck(job.data);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async handleAutoCancel(data: { bookingId: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (booking && booking.status === 'PENDING') {
      await this.prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: 'CANCELLED', cancelReason: 'Doctor did not respond' },
      });
      this.logger.log(`Auto-cancelled booking ${data.bookingId}`);
      // TODO: trigger refund job
    }
  }

  private async handleSessionEnd(data: { bookingId: string }) {
    await this.prisma.booking.update({
      where: { id: data.bookingId },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });
    this.logger.log(`Session ended for booking ${data.bookingId}`);
  }

  private async handleNoShowCheck(data: { bookingId: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (booking && booking.status === 'CONFIRMED' && !booking.startedAt) {
      await this.prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: 'NO_SHOW' },
      });
      this.logger.log(`No-show for booking ${data.bookingId}`);
    }
  }
}
