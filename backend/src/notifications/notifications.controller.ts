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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { FilterNotificationsDto } from './dto/request/filter-notifications.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { NotificationResponseDto } from './dto/response/notification-response.dto';

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
  @ApiOperation({ summary: 'Lấy danh sách notifications của user hiện tại' })
  @ApiResponse({
    status: 200,
    description:
      'Danh sách notifications. Ví dụ: [ { \"id\": 1, \"title\": \"Sự kiện được duyệt\", \"type\": \"EVENT_APPROVED\", ... } ]',
    type: NotificationResponseDto,
    isArray: true,
  })
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
  @ApiOperation({ summary: 'Lấy số lượng notifications chưa đọc' })
  @ApiResponse({
    status: 200,
    description: 'Số lượng notifications chưa đọc',
    schema: {
      example: {
        count: 5,
      },
    },
  })
  async getUnreadCount(@CurrentUser('id') userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  /**
   * Đánh dấu 1 notification đã đọc
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu một notification là đã đọc' })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu đã đọc thành công',
    type: NotificationResponseDto,
  })
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
  @ApiOperation({ summary: 'Đánh dấu tất cả notifications là đã đọc' })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu tất cả đã đọc thành công',
    schema: {
      example: {
        success: true,
      },
    },
  })
  async markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * Xóa notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một notification' })
  @ApiResponse({
    status: 200,
    description: 'Xóa notification thành công',
    schema: {
      example: {
        success: true,
      },
    },
  })
  async deleteNotification(
    @Param('id', ParseIntPipe) notificationId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.notificationsService.deleteNotification(notificationId, userId);
  }
}

