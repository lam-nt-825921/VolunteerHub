// src/posts/dto/request/update-comment.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

