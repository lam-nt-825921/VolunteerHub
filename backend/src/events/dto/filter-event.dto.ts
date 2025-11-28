// src/events/dto/filter-events.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, Min, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { EventStatus, EventVisibility } from '../../generated/prisma/enums';

export class FilterEventsDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(EventStatus, { each: true })
  status?: EventStatus | EventStatus[];

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;

  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => Number(value) || 10)
  @IsInt()
  @Min(1)
  limit = 10;
}