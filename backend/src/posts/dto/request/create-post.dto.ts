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
    example: ['https://res.cloudinary.com/example/image1.jpg', 'https://res.cloudinary.com/example/image2.jpg'],
    description: 'Mảng URL ảnh từ Cloudinary',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // Mảng URL ảnh từ Cloudinary

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

