import { IsString, IsEmail, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+\d{10,15}$/, { message: 'Phone must be in E.164 format' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+\d{10,15}$/, { message: 'Phone must be in E.164 format' })
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  otp: string;
}

export class DoctorRegisterDto {
  @ApiProperty({ example: 'doctor@blinkcure.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Dr. Sharma' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class DoctorLoginDto {
  @ApiProperty({ example: 'doctor@blinkcure.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  password: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@blinkcure.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'AdminP@ss123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
