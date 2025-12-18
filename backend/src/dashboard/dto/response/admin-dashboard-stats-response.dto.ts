// src/dashboard/dto/response/admin-dashboard-stats-response.dto.ts
import { Expose } from 'class-transformer';

/**
 * DTO response cho thống kê dashboard của ADMIN
 */
export class AdminDashboardStatsResponseDto {
  @Expose()
  totalEvents: number;

  @Expose()
  totalEventsCompletedThisMonth: number;

  @Expose()
  totalPendingEvents: number;

  @Expose()
  totalUsers: number;

  @Expose()
  activeUsers: number;

  @Expose()
  totalRegistrationsThisMonth: number;
}


