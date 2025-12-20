// src/posts/dto/response/post-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { PostType, PostStatus } from '../../../generated/prisma/enums';

/**
 * DTO cho thông tin user trong post (nested)
 */
export class AuthorSummaryDto {
  @Expose()
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  avatar: string | null;

  @Expose()
  reputationScore: number;
}

/**
 * DTO response cho Post
 */
export class PostResponseDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  images: string[]; // Parsed từ JSON string

  @Expose()
  type: PostType;

  @Expose()
  status: PostStatus;

  @Expose()
  isPinned: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  eventId: number;

  @Expose()
  @Type(() => AuthorSummaryDto)
  author: AuthorSummaryDto;

  @Expose()
  commentsCount: number;

  @Expose()
  likesCount: number;

  @Expose()
  likedByCurrentUser: boolean; // User hiện tại đã like chưa
}

