// src/dashboard/dto/response/dashboard-event-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { EventStatus, EventVisibility } from '../../../generated/prisma/enums';

/**
 * DTO cho thông tin creator trong event (nested)
 */
export class EventCreatorSummaryDto {
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
 * DTO cho category trong event (nested)
 */
export class EventCategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;
}

/**
 * DTO response cho Event trong dashboard
 */
export class DashboardEventResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  location: string;

  @Expose()
  coverImage: string | null;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  status: EventStatus;

  @Expose()
  visibility: EventVisibility;

  @Expose()
  viewCount: number;

  @Expose()
  duration: number;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => EventCreatorSummaryDto)
  creator: EventCreatorSummaryDto;

  @Expose()
  @Type(() => EventCategoryDto)
  category: EventCategoryDto | null;

  @Expose()
  registrationsCount: number; // Số người đã đăng ký

  @Expose()
  isRegistered: boolean; // User hiện tại đã đăng ký chưa

  @Expose()
  registrationStatus: string | null; // Trạng thái đăng ký của user (nếu đã đăng ký)

  @Expose()
  recommendationScore?: number; // Điểm đề xuất (chỉ có trong recommended events)
}

