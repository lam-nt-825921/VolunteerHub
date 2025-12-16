// src/posts/dto/request/filter-posts.dto.ts
import { IsOptional, IsInt, Min, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PostType } from '../../../generated/prisma/enums';

export class FilterPostsDto {
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPinned?: boolean;

  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => Number(value) || 20)
  @IsInt()
  @Min(1)
  limit = 20;
}

