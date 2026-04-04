import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super(configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
  }

  async onModuleDestroy() {
    await this.quit();
  }

  // Doctor online status
  async setDoctorOnline(doctorId: string): Promise<void> {
    await this.sadd('doctors:online', doctorId);
    await this.set(`doctor:${doctorId}:lastSeen`, Date.now().toString());
  }

  async setDoctorOffline(doctorId: string): Promise<void> {
    await this.srem('doctors:online', doctorId);
    await this.set(`doctor:${doctorId}:lastSeen`, Date.now().toString());
  }

  async getOnlineDoctors(): Promise<string[]> {
    return this.smembers('doctors:online');
  }

  async isDoctorOnline(doctorId: string): Promise<boolean> {
    return (await this.sismember('doctors:online', doctorId)) === 1;
  }

  // Active session tracking
  async setActiveSession(
    doctorId: string,
    bookingId: string,
  ): Promise<void> {
    await this.set(`session:doctor:${doctorId}`, bookingId);
    await this.set(`session:booking:${bookingId}`, doctorId);
  }

  async clearActiveSession(
    doctorId: string,
    bookingId: string,
  ): Promise<void> {
    await this.del(`session:doctor:${doctorId}`);
    await this.del(`session:booking:${bookingId}`);
  }

  async getDoctorActiveSession(doctorId: string): Promise<string | null> {
    return this.get(`session:doctor:${doctorId}`);
  }

  // OTP storage
  async setOtp(phone: string, otp: string, ttlSeconds: number): Promise<void> {
    await this.set(`otp:${phone}`, otp, 'EX', ttlSeconds);
  }

  async getOtp(phone: string): Promise<string | null> {
    return this.get(`otp:${phone}`);
  }

  async deleteOtp(phone: string): Promise<void> {
    await this.del(`otp:${phone}`);
  }
}
