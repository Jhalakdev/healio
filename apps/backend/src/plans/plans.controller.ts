import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { PlansService } from './plans.service';
import { Role } from '@prisma/client';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'List all active plans (public)' })
  listPlans() {
    return this.plansService.listPlans();
  }

  @Post(':planId/purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a plan (deducts from wallet)' })
  purchasePlan(
    @CurrentUser() user: CurrentUserData,
    @Param('planId') planId: string,
  ) {
    return this.plansService.purchasePlan(user.userId, planId);
  }

  @Get('me/active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current active plan' })
  getActivePlan(@CurrentUser() user: CurrentUserData) {
    return this.plansService.getActivePlan(user.userId);
  }

  @Get('me/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get plan purchase history' })
  getPlanHistory(@CurrentUser() user: CurrentUserData) {
    return this.plansService.getPlanHistory(user.userId);
  }
}
