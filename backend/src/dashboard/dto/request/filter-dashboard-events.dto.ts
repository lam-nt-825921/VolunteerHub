// src/dashboard/dto/request/filter-dashboard-events.dto.ts
import { IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterDashboardEventsDto {
  @ApiProperty({
    example: 'created',
    description: 'Loại events: created (đã tạo), joined (đã đăng ký), all (tất cả)',
    enum: ['created', 'joined', 'all'],
    required: false,
  })
  @IsOptional()
  @IsIn(['created', 'joined', 'all'])
  type?: 'created' | 'joined' | 'all';

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
    example: 10,
    description: 'Số lượng kết quả mỗi trang',
    type: 'integer',
    default: 10,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value) || 10)
  @IsInt()
  @Min(1)
  limit = 10;
}

