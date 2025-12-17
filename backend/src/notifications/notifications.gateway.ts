// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationResponseDto } from './dto/response/notification-response.dto';
import { plainToInstance } from 'class-transformer';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

/**
 * Gateway để push notifications realtime qua Socket.IO
 * Mỗi user sẽ join vào room `user:{userId}` để nhận notifications
 */
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedUsers = new Map<number, Set<string>>(); // userId -> Set<socketId>

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Xử lý khi client connect
   * Authenticate bằng JWT token từ query hoặc auth header
   */
  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      // Lấy token từ query string hoặc auth header
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      const userId = payload.sub;

      if (!userId) {
        this.logger.warn(`Client ${client.id} has invalid token payload`);
        client.disconnect();
        return;
      }

      // Verify user exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true },
      });

      if (!user || !user.isActive) {
        this.logger.warn(`Client ${client.id} - User ${userId} not found or inactive`);
        client.disconnect();
        return;
      }

      // Attach userId to socket
      client.userId = userId;

      // Join user-specific room
      const roomName = `user:${userId}`;
      await client.join(roomName);

      // Track connected user
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);

      this.logger.log(
        `✅ User ${userId} connected (socket: ${client.id}). Total connections: ${this.connectedUsers.get(userId)!.size}`,
      );

      // Emit connection success
      client.emit('connected', {
        userId,
        message: 'Connected to notifications',
      });
    } catch (error) {
      this.logger.error(
        `❌ Connection error for client ${client.id}:`,
        error.message,
      );
      client.disconnect();
    }
  }

  /**
   * Xử lý khi client disconnect
   */
  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    const userId = client.userId;

    if (userId) {
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
      }

      this.logger.log(
        `👋 User ${userId} disconnected (socket: ${client.id}). Remaining connections: ${userSockets?.size || 0}`,
      );
    } else {
      this.logger.log(`👋 Anonymous client ${client.id} disconnected`);
    }
  }

  /**
   * Emit notification đến user cụ thể
   * Được gọi từ NotificationsService sau khi tạo notification
   */
  async emitNotification(userId: number, notification: any) {
    const roomName = `user:${userId}`;
    const notificationDto = plainToInstance(NotificationResponseDto, notification, {
      excludeExtraneousValues: true,
    });

    this.server.to(roomName).emit('notification', notificationDto);

    this.logger.log(
      `📨 Emitted notification to user ${userId} (room: ${roomName})`,
    );
  }

  /**
   * Emit unread count update
   */
  async emitUnreadCount(userId: number, count: number) {
    const roomName = `user:${userId}`;
    this.server.to(roomName).emit('unread_count', { count });

    this.logger.debug(`📊 Emitted unread count ${count} to user ${userId}`);
  }

  /**
   * Client có thể subscribe để nhận unread count updates
   */
  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const count = await this.prisma.notification.count({
      where: {
        userId: client.userId,
        isRead: false,
      },
    });

    client.emit('unread_count', { count });
    return { count };
  }
}

