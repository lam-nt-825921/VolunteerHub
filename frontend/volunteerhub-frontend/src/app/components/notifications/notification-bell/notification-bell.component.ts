import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit {
  showDropdown = signal(false);
  notifications: Notification[] = [];
  unreadCount = signal(0);

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
    // Request notification permission on init
    this.notificationService.requestPermission();
  }

  loadNotifications() {
    const user = this.authService.user();
    if (user) {
      this.notifications = this.notificationService.getUserNotifications(user.id);
      this.unreadCount.set(this.notificationService.getUnreadCount(user.id));
    }
  }

  toggleDropdown() {
    this.showDropdown.update(v => !v);
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

  markAsRead(notification: Notification) {
    const user = this.authService.user();
    if (user) {
      this.notificationService.markAsRead(notification.id, user.id);
      this.loadNotifications();
    }
  }

  markAllAsRead() {
    const user = this.authService.user();
    if (user) {
      this.notificationService.markAllAsRead(user.id);
      this.loadNotifications();
    }
  }

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification);
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
}

