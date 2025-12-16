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
import { EventVisibility } from '../../generated/prisma/enums';

export class CreateEventDto {
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @IsString()
  @MinLength(3)
  location: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility = EventVisibility.PUBLIC;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;
}