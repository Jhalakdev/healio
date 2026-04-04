import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingMode } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ enum: BookingMode })
  @IsEnum(BookingMode)
  mode: BookingMode;

  @ApiPropertyOptional({ description: 'Required for scheduled, optional for instant (matching engine)' })
  @IsString()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Used by matching engine for instant consult' })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.mode === 'SCHEDULED')
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  symptoms?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  medications?: string;

  @ApiPropertyOptional({ description: 'Coupon code to apply discount' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Use active plan instead of wallet payment' })
  @IsBoolean()
  @IsOptional()
  usePlan?: boolean;
}
