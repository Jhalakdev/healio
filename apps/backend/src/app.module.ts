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
    ReportsModule,
    VideoModule,
    ChatModule,
    AdminModule,
  ],
})
export class AppModule {}
