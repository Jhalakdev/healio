import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Patient submits review after consultation
  async createReview(
    userId: string,
    bookingId: string,
    data: { rating: number; comment?: string; isAnonymous?: boolean },
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { patient: true, review: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.patient.userId !== userId) throw new ForbiddenException();
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Can only review completed consultations');
    }
    if (booking.review) {
      throw new BadRequestException('Already reviewed this consultation');
    }

    return this.prisma.review.create({
      data: {
        bookingId,
        doctorId: booking.doctorId,
        patientId: booking.patientId,
        rating: data.rating,
        comment: data.comment,
        isAnonymous: data.isAnonymous ?? false,
      },
    });
  }

  // Get reviews for a doctor (public)
  async getDoctorReviews(doctorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      this.prisma.review.findMany({
        where: { doctorId },
        include: {
          patient: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { doctorId } }),
      this.prisma.review.aggregate({
        where: { doctorId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    // Mask patient name if anonymous
    const maskedReviews = reviews.map((r) => ({
      ...r,
      patient: r.isAnonymous
        ? { name: 'Anonymous' }
        : { name: r.patient.name || 'Patient' },
    }));

    // Rating distribution
    const distribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { doctorId },
      _count: true,
    });

    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      ratingBreakdown[d.rating] = d._count;
    });

    return {
      reviews: maskedReviews,
      stats: {
        averageRating: Math.round((stats._avg.rating || 0) * 10) / 10,
        totalReviews: stats._count,
        ratingBreakdown,
      },
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  // Get doctor's public stats (for profile)
  async getDoctorStats(doctorId: string) {
    const [reviewStats, totalPatients, totalConsultations] = await Promise.all([
      this.prisma.review.aggregate({
        where: { doctorId },
        _avg: { rating: true },
        _count: true,
      }),
      this.prisma.booking.findMany({
        where: { doctorId, status: 'COMPLETED' },
        select: { patientId: true },
        distinct: ['patientId'],
      }),
      this.prisma.booking.count({
        where: { doctorId, status: 'COMPLETED' },
      }),
    ]);

    return {
      averageRating: Math.round((reviewStats._avg.rating || 0) * 10) / 10,
      totalReviews: reviewStats._count,
      totalPatients: totalPatients.length,
      totalConsultations,
    };
  }
}
