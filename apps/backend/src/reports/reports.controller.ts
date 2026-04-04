import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-fastify';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { Role } from '@prisma/client';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // ─── PATIENT ENDPOINTS ────────────────────────────

  @Post('upload')
  @Roles(Role.PATIENT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload report (with expiry window check + doctor notification)' })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: any,
    @Query('bookingId') bookingId?: string,
  ) {
    return this.reportsService.uploadReport(user.userId, bookingId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get patient reports (with days left + doctor replies)' })
  getReports(
    @CurrentUser() user: CurrentUserData,
    @Query('bookingId') bookingId?: string,
  ) {
    return this.reportsService.getReports(user.userId, bookingId);
  }

  @Get('upload-window/:bookingId')
  @ApiOperation({ summary: 'Check report upload window (days left)' })
  getUploadWindow(@Param('bookingId') bookingId: string) {
    return this.reportsService.getUploadWindow(bookingId);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get signed download URL' })
  getSignedUrl(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reportsService.getSignedUrl(id, user.userId);
  }

  // ─── DOCTOR ENDPOINTS ─────────────────────────────

  @Get('doctor/all')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Doctor: view reports from their patients' })
  getDoctorReports(
    @CurrentUser() user: CurrentUserData,
    @Query('bookingId') bookingId?: string,
  ) {
    return this.reportsService.getDoctorReports(user.userId, bookingId);
  }

  @Post(':id/reply')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Doctor: reply to report with text' })
  replyText(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body('reply') reply: string,
  ) {
    return this.reportsService.doctorReplyText(user.userId, id, reply);
  }

  @Post(':id/reply-voice')
  @Roles(Role.DOCTOR)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Doctor: reply to report with voice note (within 24hrs)' })
  @UseInterceptors(FileInterceptor('file'))
  replyVoice(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    return this.reportsService.doctorReplyVoice(user.userId, id, file);
  }
}
