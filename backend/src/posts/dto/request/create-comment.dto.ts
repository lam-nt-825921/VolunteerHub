// src/posts/dto/request/create-comment.dto.ts
import { IsString, MinLength, MaxLength, IsOptional, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsInt()
  parentId?: number; // Nếu có = reply, nếu null = comment gốc
}

