// src/notifications/dto/request/filter-notifications.dto.ts
import { IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterNotificationsDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;

  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => Number(value) || 20)
  @IsInt()
  @Min(1)
  limit = 20;
}

