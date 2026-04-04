import {
  Controller,
  Get,
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
import { ReviewsService } from './reviews.service';
import { Role } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post(':bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit review after consultation' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @Body() body: { rating: number; comment?: string; isAnonymous?: boolean },
  ) {
    return this.reviewsService.createReview(user.userId, bookingId, body);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get doctor reviews (public)' })
  getDoctorReviews(
    @Param('doctorId') doctorId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.getDoctorReviews(doctorId, page || 1, limit || 10);
  }

  @Get('doctor/:doctorId/stats')
  @ApiOperation({ summary: 'Get doctor public stats' })
  getDoctorStats(@Param('doctorId') doctorId: string) {
    return this.reviewsService.getDoctorStats(doctorId);
  }
}
