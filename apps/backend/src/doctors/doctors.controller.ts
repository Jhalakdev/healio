import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorProfileDto } from './dto/update-doctor.dto';
import { ListDoctorsDto } from './dto/list-doctors.dto';
import { ManageSlotsDto } from './dto/manage-slots.dto';
import { Role } from '@prisma/client';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'List doctors (public)' })
  listDoctors(@Query() query: ListDoctorsDto) {
    return this.doctorsService.listDoctors(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor profile (public)' })
  getDoctorProfile(@Param('id') id: string) {
    return this.doctorsService.getDoctorProfile(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get available time slots for a doctor on a date' })
  getAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('timezone') timezone?: string,
  ) {
    return this.doctorsService.getAvailableSlots(id, date, timezone);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update doctor profile' })
  updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsService.updateProfile(user.userId, dto);
  }

  @Post('me/toggle-online')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle doctor online/offline status' })
  toggleOnline(
    @CurrentUser() user: CurrentUserData,
    @Body('isOnline') isOnline: boolean,
  ) {
    return this.doctorsService.toggleOnline(user.userId, isOnline);
  }

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get doctor dashboard' })
  getDashboard(@CurrentUser() user: CurrentUserData) {
    return this.doctorsService.getDashboard(user.userId);
  }

  @Post('me/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manage availability slots' })
  manageSlots(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: ManageSlotsDto,
  ) {
    return this.doctorsService.manageSlots(user.userId, dto.slots);
  }
}
