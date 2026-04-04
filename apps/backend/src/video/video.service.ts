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

  async generateToken(
    bookingId: string,
    userId: string,
  ): Promise<{ token: string; wsUrl: string; iceServers: any[] }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: { select: { userId: true, name: true } },
        patient: { select: { userId: true, name: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.livekitRoom) throw new NotFoundException('Room not created');

    // Verify participant
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
      ttl: booking.durationMin * 60 + 300, // session duration + 5 min buffer
    });
    token.addGrant(grant);

    const wsUrl = this.config.get<string>('LIVEKIT_API_URL', 'ws://localhost:7880');

    // ICE servers with TURN for NAT traversal
    const iceServers = [
      { urls: ['stun:stun.l.google.com:19302'] },
      {
        urls: [this.config.get<string>('TURN_URL', 'turn:localhost:3478')],
        username: this.config.get<string>('TURN_USERNAME', 'healio'),
        credential: this.config.get<string>('TURN_PASSWORD', 'healio_turn_dev'),
      },
    ];

    return {
      token: await token.toJwt(),
      wsUrl,
      iceServers,
    };
  }
}
