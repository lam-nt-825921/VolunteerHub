// src/posts/dto/request/create-comment.dto.ts
import { IsString, MinLength, MaxLength, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Bài viết rất hay! Cảm ơn bạn đã chia sẻ.',
    description: 'Nội dung bình luận',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiProperty({
    example: 5,
    description: 'ID comment cha (nếu là reply), để null nếu là comment gốc',
    required: false,
  })
  @IsOptional()
  @IsInt()
  parentId?: number; // Nếu có = reply, nếu null = comment gốc
}

