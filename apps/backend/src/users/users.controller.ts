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
  @ApiOperation({ summary: 'Get current user profile (includes family members)' })
  getProfile(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getPatientProfile(user.userId);
  }

  @Patch('me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Update patient profile (name, dob, height, weight, blood group)' })
  updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdatePatientProfileDto,
  ) {
    return this.usersService.updatePatientProfile(user.userId, dto);
  }

  // ─── BOOKINGS (filtered) ─────────────────────────

  @Get('me/bookings')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get patient bookings (filter: upcoming/past/cancelled/all)' })
  getBookings(
    @CurrentUser() user: CurrentUserData,
    @Query('filter') filter?: 'upcoming' | 'past' | 'cancelled' | 'all',
  ) {
    return this.usersService.getPatientBookings(user.userId, filter || 'all');
  }

  @Get('me/history')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get patient consultation history' })
  async getHistory(@CurrentUser() user: CurrentUserData) {
    const patient = await this.usersService.getPatientProfile(user.userId);
    return this.usersService.getPatientHistory(patient.id);
  }

  // ─── FAMILY MEMBERS ──────────────────────────────

  @Get('me/family')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get family members' })
  getFamilyMembers(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getFamilyMembers(user.userId);
  }

  @Post('me/family')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Add a family member' })
  addFamilyMember(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { name: string; relation: string; dob?: string; gender?: string; bloodGroup?: string },
  ) {
    return this.usersService.addFamilyMember(user.userId, body);
  }

  @Delete('me/family/:id')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Remove a family member' })
  removeFamilyMember(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.usersService.removeFamilyMember(user.userId, id);
  }

  // ─── FAVOURITE DOCTORS ───────────────────────────

  @Post('me/favourites/:doctorId')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Toggle favourite doctor (add/remove)' })
  toggleFavourite(
    @CurrentUser() user: CurrentUserData,
    @Param('doctorId') doctorId: string,
  ) {
    return this.usersService.toggleFavourite(user.userId, doctorId);
  }

  @Get('me/favourites')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get favourite doctors list' })
  getFavourites(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getFavouriteDoctors(user.userId);
  }

  // ─── INBOX / CONVERSATIONS ───────────────────────

  @Get('me/conversations')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get conversation threads (inbox)' })
  getConversations(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getConversations(user.userId);
  }
}
