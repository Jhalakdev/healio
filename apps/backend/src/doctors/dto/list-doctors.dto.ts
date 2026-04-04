import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ListDoctorsDto {
  @ApiPropertyOptional({ description: 'Search by doctor name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by specialization text' })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Show only online doctors (default: true for category view)' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  onlineOnly?: boolean;
}
