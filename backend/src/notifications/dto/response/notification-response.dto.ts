// src/notifications/dto/response/notification-response.dto.ts
import { Expose, Type } from 'class-transformer';

/**
 * DTO response cho Notification
 */
export class NotificationResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  message: string;

  @Expose()
  type: string;

  @Expose()
  data: Record<string, any> | null; // Parsed từ JSON string

  @Expose()
  isRead: boolean;

  @Expose()
  createdAt: Date;
}

