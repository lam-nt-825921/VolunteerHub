// src/events/dto/update-status.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EventStatus } from '../../generated/prisma/enums';

export class UpdateEventStatusDto {
  @IsEnum(EventStatus)
  status: EventStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}