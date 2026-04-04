import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { Role } from '@prisma/client';

// ─── SPECIALISTS ────────────────────────────────────
@ApiTags('Specialists')
@Controller('categories')
export class CategoriesController {
  constructor(private svc: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List active specialists (public)' })
  listActive() { return this.svc.listActiveSpecialists(); }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'List all specialists (admin)' })
  listAll() { return this.svc.listAllSpecialists(); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create specialist (admin) — include imageUrl for uploaded icon' })
  create(@Body() body: { name: string; icon?: string; imageUrl?: string; sortOrder?: number }) {
    return this.svc.createSpecialist(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update specialist (admin)' })
  update(@Param('id') id: string, @Body() body: any) { return this.svc.updateSpecialist(id, body); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate specialist (admin)' })
  delete(@Param('id') id: string) { return this.svc.deleteSpecialist(id); }
}

// ─── SYMPTOMS / DISEASES ────────────────────────────
@ApiTags('Symptoms')
@Controller('symptoms')
export class SymptomsController {
  constructor(private svc: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List active symptoms with linked specialists (public)' })
  listActive() { return this.svc.listActiveSymptoms(); }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'List all symptoms (admin)' })
  listAll() { return this.svc.listAllSymptoms(); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create symptom + link to specialists (admin)' })
  create(@Body() body: { name: string; description?: string; icon?: string; imageUrl?: string; specialistIds?: string[] }) {
    return this.svc.createSymptom(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update symptom + re-link specialists (admin)' })
  update(@Param('id') id: string, @Body() body: any) { return this.svc.updateSymptom(id, body); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate symptom (admin)' })
  delete(@Param('id') id: string) { return this.svc.deleteSymptom(id); }

  @Get(':id/doctors')
  @ApiOperation({ summary: 'Find doctors who can treat this symptom (public)' })
  findDoctors(@Param('id') id: string) { return this.svc.findDoctorsBySymptom(id); }
}
