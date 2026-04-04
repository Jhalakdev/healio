import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { Role, VerificationStatus } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // Doctor Management
  @Get('doctors')
  @ApiOperation({ summary: 'List all doctors' })
  listDoctors(@Query('status') status?: VerificationStatus) {
    return this.adminService.listDoctors(status);
  }

  @Patch('doctors/:id/status')
  @ApiOperation({ summary: 'Approve/Reject/Suspend doctor' })
  updateDoctorStatus(
    @Param('id') id: string,
    @Body('status') status: VerificationStatus,
  ) {
    return this.adminService.updateDoctorStatus(id, status);
  }

  @Post('doctors/:id/block')
  @ApiOperation({ summary: 'Block a doctor' })
  blockDoctor(@Param('id') id: string) {
    return this.adminService.blockDoctor(id);
  }

  @Patch('doctors/:id/price')
  @ApiOperation({ summary: 'Set doctor consultation price' })
  setDoctorPrice(@Param('id') id: string, @Body('price') price: number) {
    return this.adminService.setDoctorPrice(id, price);
  }

  // Bookings
  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings' })
  listBookings(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.listBookings(status, page, limit);
  }

  @Post('bookings/:id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  cancelBooking(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.cancelBooking(id, reason);
  }

  // Config
  @Post('config')
  @ApiOperation({ summary: 'Set global config' })
  setConfig(@Body() body: { key: string; value: any }) {
    return this.adminService.setGlobalConfig(body.key, body.value);
  }

  @Get('config/:key')
  @ApiOperation({ summary: 'Get config value' })
  getConfig(@Param('key') key: string) {
    return this.adminService.getConfig(key);
  }

  // Coupons
  @Post('coupons')
  @ApiOperation({ summary: 'Create coupon' })
  createCoupon(@Body() body: any) {
    return this.adminService.createCoupon(body);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'List coupons' })
  listCoupons() {
    return this.adminService.listCoupons();
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Deactivate coupon' })
  deactivateCoupon(@Param('id') id: string) {
    return this.adminService.deactivateCoupon(id);
  }

  // Plans
  @Post('plans')
  @ApiOperation({ summary: 'Create plan' })
  createPlan(@Body() body: any) {
    return this.adminService.createPlan(body);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List plans' })
  listPlans() {
    return this.adminService.listPlans();
  }

  // Analytics
  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }
}
