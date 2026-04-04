import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { DoctorsModule } from '../doctors/doctors.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [DoctorsModule, PlansModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
