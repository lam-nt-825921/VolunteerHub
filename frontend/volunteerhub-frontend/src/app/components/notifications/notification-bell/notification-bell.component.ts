import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, Notification } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  showDropdown = signal(false);
  notifications: Notification[] = [];
  unreadCount = signal(0);
  isLoading = signal(false);

  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    // Update notifications and unread count when user changes
    effect(() => {
      const user = this.authService.user();
      if (user) {
        // Use setTimeout to avoid writing signals inside effect
        setTimeout(() => {
          this.updateNotifications(user.id);
          this.updateUnreadCount(user.id);
          
          // Sync periodically (every 3 seconds) as fallback to WebSocket
          if (this.syncInterval) {
            clearInterval(this.syncInterval);
          }
          this.syncInterval = setInterval(() => {
            this.updateNotifications(user.id);
            this.updateUnreadCount(user.id);
          }, 3000);
        }, 0);
      } else {
        // Use setTimeout to avoid writing signals inside effect
        setTimeout(() => {
          this.notifications = [];
          this.unreadCount.set(0);
          if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
          }
        }, 0);
      }
    });
  }

  ngOnInit() {
    // Request notification permission on init
    this.notificationService.requestPermission();
    
    const user = this.authService.user();
    if (user) {
      this.loadNotifications(user.id);
      this.loadUnreadCount(user.id);
    }
  }

  ngOnDestroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  async loadNotifications(userId: number) {
    this.isLoading.set(true);
    try {
      await this.notificationService.loadNotifications(userId);
      this.updateNotifications(userId);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadUnreadCount(userId: number) {
    try {
      await this.notificationService.loadUnreadCount(userId);
      this.updateUnreadCount(userId);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }

  updateNotifications(userId: number) {
    this.notifications = this.notificationService.getUserNotifications(userId);
  }

  updateUnreadCount(userId: number) {
    this.unreadCount.set(this.notificationService.getUnreadCount(userId));
  }

  toggleDropdown() {
    this.showDropdown.update(v => !v);
    
    // Load fresh notifications when opening dropdown
    if (!this.showDropdown()) {
      const user = this.authService.user();
      if (user) {
        this.loadNotifications(user.id);
      }
    }
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  onOverlayClick(event: Event) {
    // Close dropdown when clicking outside
    if ((event.target as HTMLElement).classList.contains('notification-dropdown-overlay')) {
      this.closeDropdown();
    }
  }

  async markAsRead(notification: Notification) {
    const user = this.authService.user();
    if (!user) return;

    try {
      await this.notificationService.markAsRead(notification.id, user.id);
      this.updateNotifications(user.id);
      this.updateUnreadCount(user.id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead() {
    const user = this.authService.user();
    if (!user) return;

    try {
      await this.notificationService.markAllAsRead(user.id);
      this.updateNotifications(user.id);
      this.updateUnreadCount(user.id);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async handleNotificationClick(notification: Notification) {
    await this.markAsRead(notification);
    
    if (notification.link) {
      this.router.navigate([notification.link]);
      this.closeDropdown();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Helper to map notification type to icon (for template)
  getNotificationIcon(type: string): string {
    if (type.includes('APPROVED') || type.includes('approved')) {
      return 'check_circle';
    } else if (type.includes('REJECTED') || type.includes('rejected')) {
      return 'cancel';
    } else if (type.includes('COMPLETED') || type.includes('completed')) {
      return 'emoji_events';
    } else if (type.includes('POST') || type.includes('COMMENT') || type.includes('post') || type.includes('comment')) {
      return 'chat_bubble';
    }
    return 'info';
  }
}
