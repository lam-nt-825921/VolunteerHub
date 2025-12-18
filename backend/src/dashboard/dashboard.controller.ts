// src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { FilterDashboardEventsDto } from './dto/request/filter-dashboard-events.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { DashboardStatsResponseDto } from './dto/response/dashboard-stats-response.dto';
import { DashboardEventResponseDto } from './dto/response/dashboard-event-response.dto';
import { ParticipationHistoryItemDto } from './dto/response/participation-history-response.dto';
import { AdminDashboardStatsResponseDto } from './dto/response/admin-dashboard-stats-response.dto';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Lấy thống kê dashboard của user
   * GET /dashboard/stats
   */
  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê dashboard của user' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê dashboard của user hiện tại',
    type: DashboardStatsResponseDto,
  })
  async getStats(@CurrentUser('id') userId: number) {
    return this.dashboardService.getStats(userId);
  }

  /**
   * Lấy danh sách events được đề xuất
   * GET /dashboard/recommended-events
   */
  @Get('recommended-events')
  @ApiOperation({ summary: 'Lấy danh sách events được đề xuất cho user' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách events được đề xuất',
    type: DashboardEventResponseDto,
    isArray: true,
  })
  async getRecommendedEvents(
    @CurrentUser('id') userId: number,
    @Query() filter: FilterDashboardEventsDto,
  ) {
    return this.dashboardService.getRecommendedEvents(userId, filter);
  }

  /**
   * Lấy danh sách events của user (đã tạo hoặc đã đăng ký)
   * GET /dashboard/my-events?type=created|joined|all
   */
  @Get('my-events')
  @ApiOperation({
    summary: 'Lấy danh sách events của user (đã tạo hoặc đã đăng ký)',
  })
  @ApiQuery({
    name: 'type',
    enum: ['created', 'joined', 'all'],
    required: false,
    description: 'Loại events: created (đã tạo), joined (đã đăng ký), all (tất cả)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách events của user',
    type: DashboardEventResponseDto,
    isArray: true,
  })
  async getMyEvents(
    @CurrentUser('id') userId: number,
    @Query() filter: FilterDashboardEventsDto,
    @Query('type') type?: 'created' | 'joined' | 'all',
  ) {
    return this.dashboardService.getMyEvents(
      userId,
      filter,
      type || 'all',
    );
  }

  /**
   * Lấy danh sách events sắp diễn ra mà user đã đăng ký
   * GET /dashboard/upcoming-events
   */
  @Get('upcoming-events')
  @ApiOperation({
    summary: 'Lấy danh sách events sắp diễn ra mà user đã đăng ký',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách events sắp diễn ra',
    type: DashboardEventResponseDto,
    isArray: true,
  })
  async getUpcomingEvents(
    @CurrentUser('id') userId: number,
    @Query() filter: FilterDashboardEventsDto,
  ) {
    return this.dashboardService.getUpcomingEvents(userId, filter);
  }

  /**
   * Lịch sử tham gia sự kiện của user hiện tại
   * GET /dashboard/participation-history
   */
  @Get('participation-history')
  @ApiOperation({
    summary: 'Lấy lịch sử tham gia sự kiện của user hiện tại',
  })
  @ApiResponse({
    status: 200,
    description:
      'Danh sách các lần tham gia sự kiện (registration) của user, bao gồm trạng thái đăng ký và thông tin sự kiện.',
    type: ParticipationHistoryItemDto,
    isArray: true,
  })
  async getParticipationHistory(
    @CurrentUser('id') userId: number,
    @Query() filter: FilterDashboardEventsDto,
  ) {
    return this.dashboardService.getParticipationHistory(userId, filter);
  }

  /**
   * Thống kê tổng quan cho ADMIN
   * GET /dashboard/admin/stats
   */
  @Get('admin/stats')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Lấy thống kê tổng quan cho ADMIN',
    description:
      'Bao gồm: tổng số sự kiện, số sự kiện hoàn thành trong tháng hiện tại, số sự kiện đang chờ duyệt, tổng số user, số user đang active, tổng số lượt đăng ký trong tháng.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê dashboard cho ADMIN',
    type: AdminDashboardStatsResponseDto,
  })
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }
}

