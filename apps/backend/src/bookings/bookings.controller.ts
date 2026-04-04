import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { Role } from '@prisma/client';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Create a new booking' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  getBooking(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookingsService.getBooking(id, user.userId);
  }

  @Patch(':id/reschedule')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Reschedule booking (once only)' })
  reschedule(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookingsService.reschedule(id, user.userId, dto);
  }

  @Delete(':id')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Cancel booking' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookingsService.cancelBooking(id, user.userId);
  }

  // Doctor endpoints
  @Get('doctor/incoming')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get doctor bookings' })
  getDoctorBookings(
    @CurrentUser() user: CurrentUserData,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.getDoctorBookings(user.userId, status);
  }

  @Post(':id/accept')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Accept a booking' })
  accept(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookingsService.acceptBooking(id, user.userId);
  }

  @Post(':id/start')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Start consultation session' })
  start(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookingsService.startSession(id, user.userId);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End consultation session' })
  end(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookingsService.endSession(id, user.userId);
  }

  @Post(':id/extend')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Extend session by 5 minutes (doctor only, once)' })
  extend(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookingsService.extendSession(id, user.userId);
  }
}
