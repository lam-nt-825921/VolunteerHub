// src/posts/dto/request/update-comment.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Đã chỉnh sửa: Bài viết rất hay! Cảm ơn bạn đã chia sẻ.',
    description: 'Nội dung bình luận đã chỉnh sửa',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

