import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { BookingProcessor } from './processors/booking.processor';
import { RefundProcessor } from './processors/refund.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: parseInt(
            new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port || '6379',
          ),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'booking' },
      { name: 'refund' },
      { name: 'notification' },
    ),
  ],
  providers: [BookingProcessor, RefundProcessor],
  exports: [BullModule],
})
export class QueueModule {}
