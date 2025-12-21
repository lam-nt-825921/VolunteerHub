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
   * Lấy danh sách notifications của user hiện tại với phân trang
   * @param userId - ID của người dùng
   * @param filter - Bộ lọc (isRead, page, limit)
   * @returns Danh sách notifications với phân trang
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
   * Lấy số lượng notifications chưa đọc của user
   * @param userId - ID của người dùng
   * @returns Số lượng notifications chưa đọc
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
   * Đánh dấu một notification là đã đọc
   * Tự động emit unread count update qua Socket.IO
   * @param notificationId - ID của notification
   * @param userId - ID của người dùng
   * @returns Notification đã được đánh dấu đọc
   * @throws NotFoundException nếu notification không tồn tại
   * @throws ForbiddenException nếu user không có quyền truy cập notification này
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
   * Đánh dấu tất cả notifications của user là đã đọc
   * Tự động emit unread count update (sẽ là 0) qua Socket.IO
   * @param userId - ID của người dùng
   * @returns Số lượng notifications đã được đánh dấu đọc
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

    this.notificationsGateway.emitUnreadCount(userId, 0);

    return {
      message: `Đã đánh dấu ${result.count} thông báo là đã đọc`,
      count: result.count,
    };
  }

  /**
   * Xóa một notification
   * @param notificationId - ID của notification
   * @param userId - ID của người dùng
   * @returns Thông báo xóa thành công
   * @throws NotFoundException nếu notification không tồn tại
   * @throws ForbiddenException nếu user không có quyền xóa notification này
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
   * Tạo notification mới (dùng trong các service khác như EventsService, RegistrationsService, PostsService)
   * Tự động emit notification và unread count update qua Socket.IO nếu user đang online
   * @param userId - ID của người dùng nhận notification
   * @param title - Tiêu đề notification
   * @param message - Nội dung notification
   * @param type - Loại notification (NotificationType)
   * @param data - Dữ liệu bổ sung (tùy chọn, sẽ được lưu dưới dạng JSON)
   * @returns Notification đã tạo
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

    try {
      await this.notificationsGateway.emitNotification(
        userId,
        notificationWithParsedData,
      );

      const unreadCount = await this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
      this.notificationsGateway.emitUnreadCount(userId, unreadCount);
    } catch (error) {
      console.error('Failed to emit notification via Socket.IO:', error);
    }

    return notificationWithParsedData;
  }

  /**
   * Parse data từ JSON string sang object
   * @param data - JSON string hoặc null
   * @returns Object đã parse hoặc null nếu không hợp lệ
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

