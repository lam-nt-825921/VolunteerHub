// src/posts/dto/request/create-post.dto.ts
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { PostType } from '../../../generated/prisma/enums';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // Mảng URL ảnh từ Cloudinary

  @IsOptional()
  @IsEnum(PostType)
  type?: PostType = PostType.DISCUSSION;
}

