// src/notifications/notifications.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterNotificationsDto } from './dto/request/filter-notifications.dto';
import { NotificationResponseDto } from './dto/response/notification-response.dto';
import { plainToInstance } from 'class-transformer';
import { NotificationsGateway } from './notifications.gateway';

interface Actor {
  id: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Danh sách notifications của user hiện tại (có pagination)
   */
  async getNotifications(userId: number, filter: FilterNotificationsDto) {
    const where: any = {
      userId,
    };

    if (filter.isRead !== undefined) {
      where.isRead = filter.isRead;
    }

    const skip = (filter.page - 1) * filter.limit;
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: filter.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          data: true,
          isRead: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    // Parse data từ JSON string sang object
    const notificationsWithParsedData = notifications.map((notif) => ({
      ...notif,
      data: this.parseData(notif.data),
    }));

    return {
      data: plainToInstance(NotificationResponseDto, notificationsWithParsedData, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  /**
   * Số lượng notifications chưa đọc
   */
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Đánh dấu 1 notification đã đọc
   */
  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true, isRead: true },
    });

    if (!notification) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông báo này');
    }

    if (notification.isRead) {
      return { message: 'Thông báo đã được đánh dấu đọc trước đó' };
    }

    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        data: true,
        isRead: true,
        createdAt: true,
      },
    });

    const notificationDto = plainToInstance(
      NotificationResponseDto,
      {
        ...updated,
        data: this.parseData(updated.data),
      },
      {
        excludeExtraneousValues: true,
      },
    );

    // Emit unread count update via Socket.IO
    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    this.notificationsGateway.emitUnreadCount(userId, unreadCount);

    return notificationDto;
  }

  /**
   * Đánh dấu tất cả notifications đã đọc
   */
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Emit unread count update (should be 0 now)
    this.notificationsGateway.emitUnreadCount(userId, 0);

    return {
      message: `Đã đánh dấu ${result.count} thông báo là đã đọc`,
      count: result.count,
    };
  }

  /**
   * Xóa notification
   */
  async deleteNotification(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true },
    });

    if (!notification) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa thông báo này');
    }

    await this.prisma.notification.delete({
      where: { id: notification.id },
    });

    return { message: 'Đã xóa thông báo thành công' };
  }

  /**
   * Helper method: Tạo notification (dùng trong các service khác)
   * Method này sẽ được gọi từ EventsService, RegistrationsService, PostsService...
   * Tự động emit qua Socket.IO nếu user đang online
   */
  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: string,
    data?: Record<string, any>,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data ? JSON.stringify(data) : null,
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        data: true,
        isRead: true,
        createdAt: true,
      },
    });

    const notificationWithParsedData = {
      ...notification,
      data: this.parseData(notification.data),
    };

    // Emit notification qua Socket.IO (nếu user đang online)
    try {
      await this.notificationsGateway.emitNotification(
        userId,
        notificationWithParsedData,
      );

      // Emit unread count update
      const unreadCount = await this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
      this.notificationsGateway.emitUnreadCount(userId, unreadCount);
    } catch (error) {
      // Log error nhưng không throw (notification đã được lưu vào DB)
      console.error('Failed to emit notification via Socket.IO:', error);
    }

    return notificationWithParsedData;
  }

  /**
   * Helper: Parse data từ JSON string sang object
   */
  private parseData(data: string | null): Record<string, any> | null {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

