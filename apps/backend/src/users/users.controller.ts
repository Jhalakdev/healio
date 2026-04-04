import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdatePatientProfileDto } from './dto/update-patient.dto';
import { Role } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getPatientProfile(user.userId);
  }

  @Patch('me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Update patient profile' })
  updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdatePatientProfileDto,
  ) {
    return this.usersService.updatePatientProfile(user.userId, dto);
  }

  @Get('me/history')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get patient consultation history' })
  async getHistory(@CurrentUser() user: CurrentUserData) {
    const patient = await this.usersService.getPatientProfile(user.userId);
    return this.usersService.getPatientHistory(patient.id);
  }
}
