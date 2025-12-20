import { Injectable, signal, effect, OnDestroy } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { NotificationsApiService, NotificationResponse } from './notifications-api.service';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';

export interface Notification extends NotificationResponse {
  link?: string;
}

/**
 * Notification Service
 * Centralized service for managing notifications with real-time updates via WebSocket
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private subscriptions = new Subscription();

  // Notification state
  private notificationsMap = signal<Map<number, Notification[]>>(new Map());
  public readonly notificationsByUser = this.notificationsMap.asReadonly();

  // Unread count state
  private unreadCountMap = signal<Map<number, number>>(new Map());
  public readonly unreadCountByUser = this.unreadCountMap.asReadonly();

  constructor(
    private notificationsApi: NotificationsApiService,
    private socketService: SocketService,
    private authService: AuthService
  ) {
    // Subscribe to real-time notifications
    const notificationSub = this.socketService.onNotification$.subscribe(notification => {
      this.handleRealtimeNotification(notification);
    });
    this.subscriptions.add(notificationSub);

    // Subscribe to real-time unread count updates
    const unreadCountSub = this.socketService.onUnreadCount$.subscribe(count => {
      const user = this.authService.user();
      if (user) {
        this.updateUnreadCount(user.id, count);
      }
    });
    this.subscriptions.add(unreadCountSub);

    // Load notifications when user changes
    effect(() => {
      const user = this.authService.user();
      if (user) {
        // Only load if we don't have notifications yet for this user
        const existingNotifications = this.notificationsMap().get(user.id);
        if (!existingNotifications || existingNotifications.length === 0) {
          // Use setTimeout to avoid writing signals inside effect
          setTimeout(() => this.loadNotifications(user.id), 0);
        }
        setTimeout(() => this.loadUnreadCount(user.id), 0);
      } else {
        // Clear notifications when user logs out - use setTimeout to avoid signal writes in effect
        setTimeout(() => {
          this.notificationsMap.set(new Map());
          this.unreadCountMap.set(new Map());
        }, 0);
      }
    });
  }

  /**
   * Load notifications from API
   */
  async loadNotifications(userId: number, page: number = 1, limit: number = 50): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.notificationsApi.getNotifications({ page, limit })
      );

      const notifications = response.data.map(notif => this.mapToNotification(notif));
      
      const currentMap = new Map(this.notificationsMap());
      currentMap.set(userId, notifications);
      this.notificationsMap.set(currentMap);
    } catch (error) {
      console.error('[NotificationService] Failed to load notifications:', error);
    }
  }

  /**
   * Load unread count from API
   */
  async loadUnreadCount(userId: number): Promise<void> {
    try {
      const count = await firstValueFrom(this.notificationsApi.getUnreadCount());
      this.updateUnreadCount(userId, count);
    } catch (error) {
      console.error('[NotificationService] Failed to load unread count:', error);
    }
  }

  /**
   * Handle real-time notification from WebSocket
   */
  private handleRealtimeNotification(notification: NotificationResponse): void {
    const user = this.authService.user();
    if (!user) return;

    const mappedNotification = this.mapToNotification(notification);
    
    // Add to the beginning of the list
    const currentMap = new Map(this.notificationsMap());
    const userNotifications = currentMap.get(user.id) || [];
    userNotifications.unshift(mappedNotification);
    
    // Keep only the latest 100 notifications in memory
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }
    
    currentMap.set(user.id, userNotifications);
    this.notificationsMap.set(currentMap);

    // Show browser notification if permission granted
    this.showBrowserNotification(mappedNotification);
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(userId: number, count: number): void {
    const currentMap = new Map(this.unreadCountMap());
    currentMap.set(userId, count);
    this.unreadCountMap.set(currentMap);
  }

  /**
   * Get notifications for a user
   */
  getUserNotifications(userId: number): Notification[] {
    return this.notificationsMap().get(userId) || [];
  }

  /**
   * Get unread count for a user
   */
  getUnreadCount(userId: number): number {
    return this.unreadCountMap().get(userId) || 0;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    try {
      await firstValueFrom(this.notificationsApi.markAsRead(notificationId));
      
      // Update local state
      const currentMap = new Map(this.notificationsMap());
      const userNotifications = currentMap.get(userId) || [];
      const notification = userNotifications.find(n => n.id === notificationId);
      
      if (notification && !notification.isRead) {
        notification.isRead = true;
        currentMap.set(userId, [...userNotifications]);
        this.notificationsMap.set(currentMap);
        
        // Update unread count
        const currentCount = this.unreadCountMap().get(userId) || 0;
        this.updateUnreadCount(userId, Math.max(0, currentCount - 1));
      }
    } catch (error) {
      console.error('[NotificationService] Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number): Promise<void> {
    try {
      await firstValueFrom(this.notificationsApi.markAllAsRead());
      
      // Update local state
      const currentMap = new Map(this.notificationsMap());
      const userNotifications = currentMap.get(userId) || [];
      userNotifications.forEach(n => n.isRead = true);
      currentMap.set(userId, [...userNotifications]);
      this.notificationsMap.set(currentMap);
      
      // Update unread count to 0
      this.updateUnreadCount(userId, 0);
    } catch (error) {
      console.error('[NotificationService] Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    try {
      await firstValueFrom(this.notificationsApi.deleteNotification(notificationId));
      
      // Update local state
      const currentMap = new Map(this.notificationsMap());
      const userNotifications = currentMap.get(userId) || [];
      const filtered = userNotifications.filter(n => n.id !== notificationId);
      currentMap.set(userId, filtered);
      this.notificationsMap.set(currentMap);
      
      // Update unread count if notification was unread
      const deletedNotification = userNotifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        const currentCount = this.unreadCountMap().get(userId) || 0;
        this.updateUnreadCount(userId, Math.max(0, currentCount - 1));
      }
    } catch (error) {
      console.error('[NotificationService] Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Map API response to Notification with link generation
   */
  private mapToNotification(notif: NotificationResponse): Notification {
    const link = this.generateNotificationLink(notif);
    return {
      ...notif,
      link
    };
  }

  /**
   * Generate navigation link based on notification type and data
   */
  private generateNotificationLink(notification: NotificationResponse): string | undefined {
    if (!notification.data) return undefined;

    const { eventId, postId, commentId } = notification.data;

    // Event-related notifications
    if (eventId) {
      if (notification.type.includes('POST') || notification.type.includes('COMMENT')) {
        return `/events/${eventId}`; // Navigate to event detail page
      }
      return `/events/${eventId}`;
    }

    // Post-related notifications
    if (postId && eventId) {
      return `/events/${eventId}`; // Navigate to event with post
    }

    return undefined;
  }

  /**
   * Show browser notification
   */
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) {
      return; // Browser doesn't support notifications
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/LOGO_Volunteer-Hub.png',
        badge: '/LOGO_Volunteer-Hub.png',
        tag: `notification-${notification.id}`,
        requireInteraction: false
      });
    } else if (Notification.permission === 'default') {
      // Permission hasn't been requested yet
      // Will be requested by the component
    }
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.resolve('denied');
    }

    if (Notification.permission === 'default') {
      return Notification.requestPermission();
    }

    return Promise.resolve(Notification.permission);
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
