import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(data: {
    bookingId: string;
    senderId: string;
    type: MessageType;
    content: string;
    fileUrl?: string;
  }) {
    return this.prisma.message.create({
      data: {
        bookingId: data.bookingId,
        senderId: data.senderId,
        type: data.type,
        content: data.content,
        fileUrl: data.fileUrl,
      },
    });
  }

  async getMessages(bookingId: string) {
    return this.prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, role: true } },
      },
    });
  }
}
