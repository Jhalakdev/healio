import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideoService {
  private apiKey: string;
  private apiSecret: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = config.get<string>('LIVEKIT_API_KEY', 'devkey');
    this.apiSecret = config.get<string>('LIVEKIT_API_SECRET', 'secret');
  }

  /**
   * Generate a LiveKit token for joining a video room.
   * Using self-hosted LiveKit (Docker / K8s) — zero cloud cost.
   * LiveKit handles TURN/ICE/adaptive bitrate/reconnection automatically.
   */
  async generateToken(
    bookingId: string,
    userId: string,
  ): Promise<{ token: string; wsUrl: string }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: { select: { userId: true, name: true } },
        patient: { select: { userId: true, name: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.livekitRoom) throw new NotFoundException('Room not created');

    // Verify participant is part of this booking
    const isDoctor = booking.doctor.userId === userId;
    const isPatient = booking.patient.userId === userId;
    if (!isDoctor && !isPatient) throw new ForbiddenException();

    const participantName = isDoctor
      ? `Dr. ${booking.doctor.name}`
      : booking.patient.name || 'Patient';

    const grant: VideoGrant = {
      roomJoin: true,
      room: booking.livekitRoom,
      canPublish: true,
      canSubscribe: true,
    };

    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: userId,
      name: participantName,
      ttl: booking.durationMin * 60 + 300, // session + 5 min buffer
    });
    token.addGrant(grant);

    const wsUrl = this.config.get<string>('LIVEKIT_API_URL', 'ws://localhost:7880');

    return {
      token: await token.toJwt(),
      wsUrl,
    };
  }
}
