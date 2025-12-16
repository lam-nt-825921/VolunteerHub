// src/dashboard/dashboard.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
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
  @ApiResponse({ status: 200, description: 'Thống kê dashboard' })
  async getStats(@CurrentUser('id') userId: number) {
    return this.dashboardService.getStats(userId);
  }

  /**
   * Lấy danh sách events được đề xuất
   * GET /dashboard/recommended-events
   */
  @Get('recommended-events')
  @ApiOperation({ summary: 'Lấy danh sách events được đề xuất cho user' })
  @ApiResponse({ status: 200, description: 'Danh sách events được đề xuất' })
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
  @ApiResponse({ status: 200, description: 'Danh sách events của user' })
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
  })
  async getUpcomingEvents(
    @CurrentUser('id') userId: number,
    @Query() filter: FilterDashboardEventsDto,
  ) {
    return this.dashboardService.getUpcomingEvents(userId, filter);
  }
}

