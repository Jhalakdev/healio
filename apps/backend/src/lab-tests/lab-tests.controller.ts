import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { LabTestsService } from './lab-tests.service';
import { Role } from '@prisma/client';

@ApiTags('Lab Tests')
@Controller('lab-tests')
export class LabTestsController {
  constructor(private svc: LabTestsService) {}

  // ─── PUBLIC ───────────────────────────────────────

  @Get('tests')
  @ApiOperation({ summary: 'Browse available lab tests (public)' })
  listTests(@Query('category') category?: string, @Query('search') search?: string) {
    return this.svc.listTests(category, search);
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Get test details' })
  getTest(@Param('id') id: string) { return this.svc.getTest(id); }

  @Get('categories')
  @ApiOperation({ summary: 'Get test categories' })
  getCategories() { return this.svc.getCategories(); }

  @Get('packages')
  @ApiOperation({ summary: 'Get popular test packages' })
  getPackages() { return this.svc.getPopularPackages(); }

  // ─── PATIENT ──────────────────────────────────────

  @Post('order')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.PATIENT) @ApiBearerAuth()
  @ApiOperation({ summary: 'Patient: book lab test (self-order)' })
  createOrder(@CurrentUser() user: CurrentUserData, @Body() body: any) {
    return this.svc.createOrder(user.userId, body);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Patient: get my lab test orders' })
  getMyOrders(@CurrentUser() user: CurrentUserData) {
    return this.svc.getMyOrders(user.userId);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details' })
  getOrder(@Param('id') id: string) { return this.svc.getOrder(id); }

  // ─── DOCTOR ───────────────────────────────────────

  @Post('doctor-order')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.DOCTOR) @ApiBearerAuth()
  @ApiOperation({ summary: 'Doctor: order lab test for patient' })
  doctorOrder(@CurrentUser() user: CurrentUserData, @Body() body: any) {
    return this.svc.doctorOrderTest(user.userId, body);
  }

  // ─── ADMIN ────────────────────────────────────────

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: lab test analytics' })
  adminDashboard() { return this.svc.adminDashboard(); }

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all lab orders' })
  adminOrders(@Query('status') status?: string, @Query('page') page?: number) {
    return this.svc.adminListOrders(status, page);
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update order status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string; phlebotomistName?: string; phlebotomistPhone?: string }) {
    return this.svc.updateOrderStatus(id, body.status, body);
  }

  @Post('admin/orders/:id/report')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: upload report for order' })
  uploadReport(@Param('id') id: string, @Body() body: { fileName: string; fileUrl: string }) {
    return this.svc.adminUploadReport(id, body.fileName, body.fileUrl);
  }

  // Admin: manage tests
  @Post('admin/tests')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: add lab test' })
  createTest(@Body() body: any) { return this.svc.adminCreateTest(body); }

  @Patch('admin/tests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update lab test' })
  updateTest(@Param('id') id: string, @Body() body: any) { return this.svc.adminUpdateTest(id, body); }

  // Admin: manage providers
  @Get('admin/providers')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list lab providers' })
  listProviders() { return this.svc.adminListProviders(); }

  @Post('admin/providers')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: add lab provider' })
  createProvider(@Body() body: any) { return this.svc.adminCreateProvider(body); }

  @Patch('admin/providers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update provider' })
  updateProvider(@Param('id') id: string, @Body() body: any) { return this.svc.adminUpdateProvider(id, body); }
}
