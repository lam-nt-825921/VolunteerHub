// src/notifications/dto/request/filter-notifications.dto.ts
import { IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterNotificationsDto {
  @ApiProperty({
    example: false,
    description: 'Lọc theo trạng thái đã đọc/chưa đọc',
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({
    example: 1,
    description: 'Số trang',
    type: 'integer',
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiProperty({
    example: 20,
    description: 'Số lượng kết quả mỗi trang',
    type: 'integer',
    default: 20,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value) || 20)
  @IsInt()
  @Min(1)
  limit = 20;
}

