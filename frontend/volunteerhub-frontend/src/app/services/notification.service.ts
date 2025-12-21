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
  
  // Track loading state to prevent duplicate API calls
  private loadingUnreadCount = new Map<number, boolean>();
  private loadingNotifications = new Map<number, boolean>();

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

    // Load unread count when user changes (lightweight, needed for badge)
    // But DON'T load full notifications list - only load on demand (when user opens dropdown)
    effect(() => {
      const user = this.authService.user();
      if (user) {
        // Only load unread count if we don't have it yet for this user
        // This is lightweight and needed for the notification badge
        const existingUnreadCount = this.unreadCountMap().get(user.id);
        if (existingUnreadCount === undefined) {
          setTimeout(() => this.loadUnreadCount(user.id), 0);
        }
      } else {
        // Clear notifications when user logs out - use setTimeout to avoid signal writes in effect
        setTimeout(() => {
          this.notificationsMap.set(new Map());
          this.unreadCountMap.set(new Map());
          this.loadingUnreadCount.clear();
          this.loadingNotifications.clear();
        }, 0);
      }
    });
  }

  /**
   * Load notifications from API
   */
  async loadNotifications(userId: number, page: number = 1, limit: number = 50): Promise<void> {
    // Prevent duplicate API calls
    if (this.loadingNotifications.get(userId)) {
      return;
    }
    
    // Check if we already have notifications for this user (only for page 1)
    if (page === 1) {
      const existingNotifications = this.notificationsMap().get(userId);
      if (existingNotifications && existingNotifications.length > 0) {
        return; // Already loaded
      }
    }
    
    this.loadingNotifications.set(userId, true);
    try {
      const response = await firstValueFrom(
        this.notificationsApi.getNotifications({ page, limit })
      );

      const notifications = response.data.map(notif => this.mapToNotification(notif));
      
      const currentMap = new Map(this.notificationsMap());
      if (page === 1) {
        // Replace for page 1
        currentMap.set(userId, notifications);
      } else {
        // Append for subsequent pages
        const existing = currentMap.get(userId) || [];
        currentMap.set(userId, [...existing, ...notifications]);
      }
      this.notificationsMap.set(currentMap);
    } catch (error) {
      console.error('[NotificationService] Failed to load notifications:', error);
    } finally {
      this.loadingNotifications.set(userId, false);
    }
  }

  /**
   * Load unread count from API
   */
  async loadUnreadCount(userId: number): Promise<void> {
    // Prevent duplicate API calls
    if (this.loadingUnreadCount.get(userId)) {
      return;
    }
    
    // Check if we already have unread count for this user
    const existingCount = this.unreadCountMap().get(userId);
    if (existingCount !== undefined) {
      return; // Already loaded
    }
    
    this.loadingUnreadCount.set(userId, true);
    try {
      const count = await firstValueFrom(this.notificationsApi.getUnreadCount());
      this.updateUnreadCount(userId, count);
    } catch (error) {
      console.error('[NotificationService] Failed to load unread count:', error);
    } finally {
      this.loadingUnreadCount.set(userId, false);
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
    
    // Check if notification already exists (avoid duplicates)
    const existingIndex = userNotifications.findIndex(n => n.id === notification.id);
    if (existingIndex === -1) {
      userNotifications.unshift(mappedNotification);
      
      // Keep only the latest 100 notifications in memory
      if (userNotifications.length > 100) {
        userNotifications.splice(100);
      }
      
      currentMap.set(user.id, userNotifications);
      this.notificationsMap.set(currentMap);

      // Update unread count (increment by 1)
      const currentCount = this.unreadCountMap().get(user.id) || 0;
      this.updateUnreadCount(user.id, currentCount + 1);

      // Show browser notification if permission granted
      this.showBrowserNotification(mappedNotification);
    }
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

    // For comment replies, navigate to post detail with comment highlight
    if (notification.type.includes('COMMENT_REPLY') && postId && commentId) {
      return `/posts/${postId}?commentId=${commentId}`;
    }

    // For post-related notifications, navigate to post detail
    if (notification.type.includes('POST') && postId) {
      return `/posts/${postId}`;
    }

    // For comment notifications (new comment on post), navigate to post detail
    if (notification.type.includes('COMMENT') && postId) {
      if (commentId) {
        return `/posts/${postId}?commentId=${commentId}`;
      }
      return `/posts/${postId}`;
    }

    // Fallback to event page if only eventId is available
    if (eventId) {
      return `/events/${eventId}`;
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
