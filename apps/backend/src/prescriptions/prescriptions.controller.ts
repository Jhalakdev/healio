import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { PrescriptionsService } from './prescriptions.service';
import { Role } from '@prisma/client';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Post(':bookingId')
  @UseGuards(RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Create/update text prescription' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @Body() body: { content?: string; notes?: string },
  ) {
    return this.prescriptionsService.createPrescription(
      user.userId,
      bookingId,
      body,
    );
  }

  @Post(':bookingId/upload')
  @UseGuards(RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload scanned/written prescription file' })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @UploadedFile() file: any,
  ) {
    return this.prescriptionsService.uploadPrescriptionFile(
      user.userId,
      bookingId,
      file,
    );
  }

  @Post(':bookingId/voice')
  @UseGuards(RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload voice note for prescription' })
  @UseInterceptors(FileInterceptor('file'))
  uploadVoice(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @UploadedFile() file: any,
  ) {
    return this.prescriptionsService.uploadVoiceNote(
      user.userId,
      bookingId,
      file,
    );
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'View prescription for a booking' })
  get(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
  ) {
    return this.prescriptionsService.getPrescription(bookingId, user.userId);
  }
}
