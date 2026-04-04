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
  @ApiOperation({ summary: 'List all plans (including inactive)' })
  listPlans() {
    return this.adminService.listPlans();
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update plan (price, members, validity, discount, etc.)' })
  updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updatePlan(id, body);
  }

  // Analytics
  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // Doctor Document Review
  @Get('doctors/:id/documents')
  @ApiOperation({ summary: 'View doctor verification documents' })
  getDoctorDocuments(@Param('id') id: string) {
    return this.adminService.getDoctorDocuments(id);
  }

  @Patch('documents/:id/verify')
  @ApiOperation({ summary: 'Verify/reject a doctor document' })
  verifyDocument(
    @Param('id') id: string,
    @Body('verified') verified: boolean,
  ) {
    return this.adminService.verifyDocument(id, verified);
  }

  // Admin User & Permission Management
  @Post('users')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create admin user with permissions' })
  createAdminUser(@Body() body: { email: string; password: string; modules: any[] }) {
    return this.adminService.createAdminUser(body.email, body.password, body.modules);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all admin users' })
  listAdminUsers() {
    return this.adminService.listAdminUsers();
  }

  @Get('users/:userId/permissions')
  @ApiOperation({ summary: 'Get admin user permissions' })
  getPermissions(@Param('userId') userId: string) {
    return this.adminService.getAdminPermissions(userId);
  }

  @Patch('users/:userId/permissions')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update admin user permissions' })
  updatePermissions(
    @Param('userId') userId: string,
    @Body() body: { module: string; canRead?: boolean; canWrite?: boolean; canDelete?: boolean },
  ) {
    return this.adminService.updateAdminPermissions(userId, body.module, body);
  }

  // ─── FAQ ──────────────────────────────────────────
  @Post('faqs')
  @ApiOperation({ summary: 'Create FAQ' })
  createFaq(@Body() body: { question: string; answer: string; category?: string }) {
    return this.adminService.createFaq(body);
  }

  @Get('faqs')
  @ApiOperation({ summary: 'List all FAQs' })
  listFaqs() {
    return this.adminService.listFaqs();
  }

  @Patch('faqs/:id')
  @ApiOperation({ summary: 'Update FAQ' })
  updateFaq(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateFaq(id, body);
  }

  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Delete FAQ' })
  deleteFaq(@Param('id') id: string) {
    return this.adminService.deleteFaq(id);
  }

  // ─── CMS PAGES ────────────────────────────────────
  @Post('cms/:slug')
  @ApiOperation({ summary: 'Create/update CMS page (terms, privacy, about, refund)' })
  upsertCms(@Param('slug') slug: string, @Body() body: { title: string; content: string }) {
    return this.adminService.upsertCmsPage(slug, body);
  }

  @Get('cms')
  @ApiOperation({ summary: 'List all CMS pages' })
  listCms() {
    return this.adminService.listCmsPages();
  }

  @Get('cms/:slug')
  @ApiOperation({ summary: 'Get CMS page content' })
  getCms(@Param('slug') slug: string) {
    return this.adminService.getCmsPage(slug);
  }

  // ─── BANNERS ──────────────────────────────────────
  @Post('banners')
  @ApiOperation({ summary: 'Create banner/announcement' })
  createBanner(@Body() body: any) {
    return this.adminService.createBanner(body);
  }

  @Get('banners')
  @ApiOperation({ summary: 'List all banners' })
  listBanners() {
    return this.adminService.listBanners();
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Update banner' })
  updateBanner(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateBanner(id, body);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete banner' })
  deleteBanner(@Param('id') id: string) {
    return this.adminService.deleteBanner(id);
  }

  // ─── PATIENT MANAGEMENT ───────────────────────────
  @Get('patients')
  @ApiOperation({ summary: 'List all patients' })
  listPatients(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.listPatients(page || 1, limit || 20);
  }

  @Post('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  @Post('users/:id/activate')
  @ApiOperation({ summary: 'Activate user account' })
  activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  // ─── REPORTS & PRESCRIPTIONS ──────────────────────
  @Get('reports')
  @ApiOperation({ summary: 'View all patient reports' })
  listReports(@Query('page') page?: number) {
    return this.adminService.listAllReports(page || 1);
  }

  @Get('prescriptions')
  @ApiOperation({ summary: 'View all prescriptions' })
  listPrescriptions(@Query('page') page?: number) {
    return this.adminService.listAllPrescriptions(page || 1);
  }

  // ─── NOTIFICATIONS ────────────────────────────────
  @Post('notifications/send')
  @ApiOperation({ summary: 'Send notification (single user or broadcast)' })
  sendNotification(@Body() body: { userId?: string; type: string; title: string; body: string }) {
    return this.adminService.sendNotification(body);
  }

  // ─── COMMISSION ───────────────────────────────────
  @Get('commission')
  @ApiOperation({ summary: 'Get current commission rate' })
  getCommission() {
    return this.adminService.getCommissionRate();
  }

  @Patch('commission')
  @ApiOperation({ summary: 'Set platform commission rate (%)' })
  setCommission(@Body('percent') percent: number) {
    return this.adminService.setCommissionRate(percent);
  }
}
