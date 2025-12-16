import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  userId: number;
  type: 'registration_approved' | 'registration_rejected' | 'event_completed' | 'new_post' | 'new_comment' | 'event_approved' | 'event_rejected';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  eventId?: number;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Map<number, Notification[]>>(new Map());

  public readonly notificationsByUser = this.notifications.asReadonly();

  constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        userId: 101,
        type: 'registration_approved',
        title: 'Đăng ký được duyệt',
        message: 'Đăng ký của bạn cho sự kiện "Dọn dẹp bãi biển Vũng Tàu" đã được duyệt!',
        read: false,
        createdAt: new Date().toISOString(),
        eventId: 1,
        link: '/events/1'
      }
    ];

    const notificationsMap = new Map<number, Notification[]>();
    notificationsMap.set(101, mockNotifications);
    this.notifications.set(notificationsMap);
  }

  getUserNotifications(userId: number): Notification[] {
    return this.notifications().get(userId) || [];
  }

  getUnreadCount(userId: number): number {
    return this.getUserNotifications(userId).filter(n => !n.read).length;
  }

  markAsRead(notificationId: number, userId: number): void {
    const currentNotifications = this.notifications();
    const userNotifications = currentNotifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      currentNotifications.set(userId, [...userNotifications]);
      this.notifications.set(new Map(currentNotifications));
    }
  }

  markAllAsRead(userId: number): void {
    const currentNotifications = this.notifications();
    const userNotifications = currentNotifications.get(userId) || [];
    userNotifications.forEach(n => n.read = true);
    currentNotifications.set(userId, [...userNotifications]);
    this.notifications.set(new Map(currentNotifications));
  }

  createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString()
    };

    const currentNotifications = this.notifications();
    const userNotifications = currentNotifications.get(notification.userId) || [];
    userNotifications.unshift(newNotification); // Add to beginning
    currentNotifications.set(notification.userId, userNotifications);
    this.notifications.set(new Map(currentNotifications));

    // Trigger browser notification if permission granted
    this.showBrowserNotification(newNotification);

    return newNotification;
  }

  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) {
      return; // Browser doesn't support notifications
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/LOGO_Volunteer-Hub.png',
        badge: '/LOGO_Volunteer-Hub.png',
        tag: `notification-${notification.id}`
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/LOGO_Volunteer-Hub.png',
          badge: '/LOGO_Volunteer-Hub.png',
          tag: `notification-${notification.id}`
        });
      }
    }
  }

  requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.resolve('denied');
    }

    if (Notification.permission === 'default') {
      return Notification.requestPermission();
    }

    return Promise.resolve(Notification.permission);
  }
}

