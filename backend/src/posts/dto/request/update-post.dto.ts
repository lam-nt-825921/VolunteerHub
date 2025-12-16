// src/posts/dto/request/update-post.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Dùng PartialType để giữ validator cho content/images/type,
// nhưng TypeScript không suy ra được các field đó trong service,
// nên ta mở rộng type bằng interface để compiler hiểu.

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({
    example: true,
    description: 'Ghim bài đăng lên đầu',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

// Khai báo interface để service có thể truy cập content/images/type mà không lỗi TS
export interface UpdatePostDtoShape extends Partial<CreatePostDto> {
  isPinned?: boolean;
}

