// src/dashboard/dto/response/dashboard-stats-response.dto.ts
import { Expose } from 'class-transformer';

/**
 * DTO response cho thống kê dashboard của user
 */
export class DashboardStatsResponseDto {
  @Expose()
  totalEventsCreated: number;

  @Expose()
  totalEventsJoined: number;

  @Expose()
  totalEventsAttended: number;

  @Expose()
  totalPostsCreated: number;

  @Expose()
  totalCommentsCreated: number;

  @Expose()
  totalLikesGiven: number;

  @Expose()
  reputationScore: number;

  @Expose()
  upcomingEventsCount: number;

  @Expose()
  activeEventsCount: number; // Events đang diễn ra mà user đã đăng ký
}

