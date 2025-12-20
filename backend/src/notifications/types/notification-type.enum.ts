// src/notifications/types/notification-type.enum.ts

/**
 * Enum cho các loại notification
 * Lưu trong DB dưới dạng string
 */
export enum NotificationType {
  // Hệ thống
  SYSTEM = 'SYSTEM',

  // Event related
  EVENT_APPROVED = 'EVENT_APPROVED',
  EVENT_REJECTED = 'EVENT_REJECTED',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  EVENT_COMPLETED = 'EVENT_COMPLETED',

  // Registration related
  REGISTRATION_PENDING = 'REGISTRATION_PENDING', // Đăng ký mới chờ duyệt
  REGISTRATION_APPROVED = 'REGISTRATION_APPROVED',
  REGISTRATION_REJECTED = 'REGISTRATION_REJECTED',
  REGISTRATION_KICKED = 'REGISTRATION_KICKED',

  // Post related
  NEW_POST = 'NEW_POST',
  POST_LIKED = 'POST_LIKED',

  // Comment related
  COMMENT_REPLY = 'COMMENT_REPLY',
}

