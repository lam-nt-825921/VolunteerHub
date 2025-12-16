// src/events/dto/update-status.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '../../generated/prisma/enums';

export class UpdateEventStatusDto {
  @ApiProperty({
    example: EventStatus.APPROVED,
    description: 'Trạng thái mới của sự kiện',
    enum: EventStatus,
  })
  @IsEnum(EventStatus)
  status: EventStatus;

  @ApiProperty({
    example: 'Sự kiện đã được duyệt và sẽ diễn ra như kế hoạch.',
    description: 'Ghi chú về việc thay đổi trạng thái',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}