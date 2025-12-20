// src/events/dto/update-event.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventVisibility } from '../../generated/prisma/enums';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiProperty({
    example: EventVisibility.PUBLIC,
    description: 'Mức độ hiển thị sự kiện',
    enum: EventVisibility,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;
}