// src/posts/dto/request/create-post.dto.ts
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostType } from '../../../generated/prisma/enums';

export class CreatePostDto {
  @ApiProperty({
    example: 'Hôm nay sự kiện diễn ra rất thành công! Cảm ơn tất cả mọi người đã tham gia.',
    description: 'Nội dung bài đăng',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;


  @ApiProperty({
    example: PostType.DISCUSSION,
    description: 'Loại bài đăng',
    enum: PostType,
    default: PostType.DISCUSSION,
    required: false,
  })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType = PostType.DISCUSSION;
}

