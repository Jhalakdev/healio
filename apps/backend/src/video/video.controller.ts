import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { VideoService } from './video.service';

@ApiTags('Video')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Get(':bookingId/token')
  @ApiOperation({ summary: 'Generate LiveKit video token' })
  getToken(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.videoService.generateToken(bookingId, user.userId);
  }
}
