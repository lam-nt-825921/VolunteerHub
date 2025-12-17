// src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { FilterNotificationsDto } from './dto/request/filter-notifications.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';

interface Actor {
  id: number;
  role: Role;
}

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Danh sách notifications của user hiện tại
   * GET /notifications
   */
  @Get()
  async getNotifications(
    @CurrentUser('id') userId: number,
    @Query() filter: FilterNotificationsDto,
  ) {
    return this.notificationsService.getNotifications(userId, filter);
  }

  /**
   * Số lượng notifications chưa đọc
   * GET /notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  /**
   * Đánh dấu 1 notification đã đọc
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) notificationId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  /**
   * Đánh dấu tất cả notifications đã đọc
   * PATCH /notifications/read-all
   */
  @Patch('read-all')
  async markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * Xóa notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseIntPipe) notificationId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.notificationsService.deleteNotification(notificationId, userId);
  }
}

