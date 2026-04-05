import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Public Content')
@Controller('content')
export class PublicContentController {
  constructor(private prisma: PrismaService) {}

  @Get('faqs')
  @ApiOperation({ summary: 'Get active FAQs (public)' })
  async getFaqs(@Query('category') category?: string) {
    return this.prisma.faq.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get CMS page content (terms, privacy, about, refund)' })
  async getCmsPage(@Param('slug') slug: string) {
    return this.prisma.cmsPage.findUnique({ where: { slug } });
  }

  @Get('config/:key')
  @ApiOperation({ summary: 'Get public app config value' })
  async getConfig(@Param('key') key: string) {
    const allowed = ['default_consultation_duration_minutes', 'max_wallet_balance', 'platform_commission_percent'];
    if (!allowed.includes(key)) return null;
    return this.prisma.appConfig.findUnique({ where: { key } });
  }

  @Get('banners')
  @ApiOperation({ summary: 'Get active banners for app' })
  async getBanners(@Query('target') target?: string) {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        target: { in: [target || 'patient', 'all'] },
        OR: [{ startDate: null }, { startDate: { lte: now } }],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
