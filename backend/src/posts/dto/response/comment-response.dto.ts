// src/posts/dto/response/comment-response.dto.ts
import { Expose, Type } from 'class-transformer';

/**
 * DTO cho thông tin user trong comment (nested)
 */
export class CommentAuthorDto {
  @Expose()
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  avatar: string | null;
}

/**
 * DTO response cho Comment (hỗ trợ nested replies)
 */
export class CommentResponseDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  parentId: number | null;

  @Expose()
  postId: number;

  @Expose()
  @Type(() => CommentAuthorDto)
  author: CommentAuthorDto;

  @Expose()
  @Type(() => CommentResponseDto)
  replies?: CommentResponseDto[]; // Nested replies (optional, chỉ khi load detail)
}

