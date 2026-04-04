import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessageType } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private config: ConfigService,
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      client.userId = payload.sub;
      client.role = payload.role;

      this.logger.log(`Client connected: ${client.userId}`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId && client.role === 'DOCTOR') {
      // Update doctor last seen on disconnect
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: client.userId },
      });
      if (doctor) {
        await this.redis.setDoctorOffline(doctor.id);
        await this.prisma.doctor.update({
          where: { id: doctor.id },
          data: { isOnline: false, lastSeenAt: new Date() },
        });
        this.server.emit('doctor:status', {
          doctorId: doctor.id,
          isOnline: false,
        });
      }
    }
    this.logger.log(`Client disconnected: ${client.userId}`);
  }

  @SubscribeMessage('join:booking')
  async handleJoinBooking(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { bookingId: string },
  ) {
    client.join(`booking:${data.bookingId}`);
    this.logger.log(`${client.userId} joined booking:${data.bookingId}`);
  }

  @SubscribeMessage('chat:message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      bookingId: string;
      type: MessageType;
      content: string;
      fileUrl?: string;
    },
  ) {
    if (!client.userId) return;

    const message = await this.chatService.saveMessage({
      bookingId: data.bookingId,
      senderId: client.userId,
      type: data.type,
      content: data.content,
      fileUrl: data.fileUrl,
    });

    // Broadcast to all in the booking room
    this.server.to(`booking:${data.bookingId}`).emit('chat:message', message);
  }

  @SubscribeMessage('report:uploaded')
  async handleReportUploaded(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { bookingId: string; reportId: string },
  ) {
    // Notify doctor in real-time when patient uploads a report during call
    this.server.to(`booking:${data.bookingId}`).emit('report:new', {
      reportId: data.reportId,
      uploadedBy: client.userId,
    });
  }

  @SubscribeMessage('doctor:online')
  async handleDoctorOnline(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId || client.role !== 'DOCTOR') return;

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: client.userId },
    });
    if (!doctor) return;

    await this.redis.setDoctorOnline(doctor.id);
    await this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { isOnline: true },
    });

    this.server.emit('doctor:status', { doctorId: doctor.id, isOnline: true });
  }

  @SubscribeMessage('session:timer')
  async handleTimerUpdate(
    @MessageBody() data: { bookingId: string; remainingSeconds: number },
  ) {
    this.server.to(`booking:${data.bookingId}`).emit('session:timer', {
      remainingSeconds: data.remainingSeconds,
    });
  }

  // Emit session extension to both participants
  emitSessionExtended(bookingId: string, newDurationMin: number) {
    this.server.to(`booking:${bookingId}`).emit('session:extended', {
      newDurationMin,
    });
  }
}
