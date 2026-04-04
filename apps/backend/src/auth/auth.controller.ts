import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  DoctorRegisterDto,
  DoctorLoginDto,
  AdminLoginDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { ThrottleGuard, Throttle } from '../common/guards/throttle.guard';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottleGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('patient/send-otp')
  @Throttle(3, 60) // 3 OTP requests per minute per IP
  @ApiOperation({ summary: 'Send OTP to patient phone' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('patient/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and login/register patient' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Post('doctor/register')
  @ApiOperation({ summary: 'Register new doctor' })
  async doctorRegister(@Body() dto: DoctorRegisterDto) {
    return this.authService.doctorRegister(dto.email, dto.password, dto.name);
  }

  @Post('doctor/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Doctor login' })
  async doctorLogin(@Body() dto: DoctorLoginDto) {
    return this.authService.doctorLogin(dto.email, dto.password);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }
}
