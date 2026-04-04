import {
  Controller,
  Get,
  Post,
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

  @Post('upload')
  @Roles(Role.PATIENT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a report (PDF/Image)' })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: any,
    @Query('bookingId') bookingId?: string,
  ) {
    return this.reportsService.uploadReport(user.userId, bookingId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get patient reports' })
  getReports(
    @CurrentUser() user: CurrentUserData,
    @Query('bookingId') bookingId?: string,
  ) {
    return this.reportsService.getReports(user.userId, bookingId);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get signed download URL for a report' })
  getSignedUrl(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reportsService.getSignedUrl(id, user.userId);
  }
}
