import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { BookingsModule } from './bookings/bookings.module';
import { WalletModule } from './wallet/wallet.module';
import { ReportsModule } from './reports/reports.module';
import { VideoModule } from './video/video.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { PlansModule } from './plans/plans.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    QueueModule,
    StorageModule,
    AuthModule,
    UsersModule,
    DoctorsModule,
    BookingsModule,
    WalletModule,
    PlansModule,
    PrescriptionsModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    ReportsModule,
    VideoModule,
    ChatModule,
    AdminModule,
  ],
})
export class AppModule {}
