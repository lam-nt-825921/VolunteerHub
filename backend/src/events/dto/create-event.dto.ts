// src/events/dto/create-event.dto.ts
import { IsString, MinLength, MaxLength, IsDateString, IsOptional, IsInt, Min, IsEnum, IsUrl } from 'class-validator';
import { EventStatus } from '../../generated/prisma/enums';
import { EventVisibility } from '../../generated/prisma/enums';

export class CreateEventDto {
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @IsString()
  @MinLength(3)
  location: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility = EventVisibility.PUBLIC;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  publicSummary?: string;
}