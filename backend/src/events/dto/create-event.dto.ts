// src/events/dto/create-event.dto.ts
import {
  IsString,
  MinLength,
  MaxLength,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventVisibility } from '../../generated/prisma/enums';

export class CreateEventDto {
  @ApiProperty({
    example: 'Ngày hội tình nguyện 2025',
    description: 'Tiêu đề sự kiện',
    minLength: 5,
    maxLength: 120,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @ApiProperty({
    example: 'Sự kiện tình nguyện lớn nhất năm với nhiều hoạt động ý nghĩa...',
    description: 'Mô tả chi tiết sự kiện',
    minLength: 20,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    example: 'Công viên Lê Văn Tám, Quận 1, TP.HCM',
    description: 'Địa điểm tổ chức',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  location: string;

  @ApiProperty({
    example: '2025-01-15T08:00:00Z',
    description: 'Thời gian bắt đầu (ISO 8601)',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    example: '2025-01-15T17:00:00Z',
    description: 'Thời gian kết thúc (ISO 8601)',
  })
  @IsDateString()
  endTime: string;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    description: 'URL ảnh bìa sự kiện',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @ApiProperty({
    example: EventVisibility.PUBLIC,
    description: 'Mức độ hiển thị sự kiện',
    enum: EventVisibility,
    default: EventVisibility.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility = EventVisibility.PUBLIC;

  @ApiProperty({
    example: 1,
    description: 'ID danh mục sự kiện',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;
}