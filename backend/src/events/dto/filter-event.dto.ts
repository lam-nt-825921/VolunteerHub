// src/events/dto/filter-events.dto.ts
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus, EventVisibility } from '../../generated/prisma/enums';

export class FilterEventsDto {
  @ApiProperty({
    example: 'tình nguyện',
    description: 'Từ khóa tìm kiếm (tiêu đề, mô tả)',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    example: EventStatus.APPROVED,
    description: 'Lọc theo trạng thái sự kiện',
    enum: EventStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventStatus, { each: true })
  status?: EventStatus | EventStatus[];

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'Lọc sự kiện từ ngày (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'Lọc sự kiện đến ngày (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiProperty({
    example: EventVisibility.PUBLIC,
    description: 'Lọc theo mức độ hiển thị',
    enum: EventVisibility,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;

  @ApiProperty({
    example: 1,
    description: 'Lọc theo ID danh mục',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiProperty({
    example: 1,
    description: 'Số trang',
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiProperty({
    example: 10,
    description: 'Số lượng kết quả mỗi trang',
    default: 10,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value) || 10)
  @IsInt()
  @Min(1)
  limit = 10;
}