// src/posts/dto/request/filter-posts.dto.ts
import { IsOptional, IsInt, Min, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PostType } from '../../../generated/prisma/enums';

export class FilterPostsDto {
  @ApiProperty({
    example: PostType.DISCUSSION,
    description: 'Lọc theo loại bài đăng',
    enum: PostType,
    required: false,
  })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiProperty({
    example: true,
    description: 'Chỉ lấy bài đăng đã ghim',
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPinned?: boolean;

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

