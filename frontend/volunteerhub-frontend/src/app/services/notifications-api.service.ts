import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { API_CONFIG } from './api.config';

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsListResponse {
  data: NotificationResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface FilterNotificationsParams {
  isRead?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Notifications API Service
 * Handles all notification-related HTTP API calls
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Get notifications list with pagination
   */
  getNotifications(params: FilterNotificationsParams = {}): Observable<NotificationsListResponse> {
    const queryParams = new URLSearchParams();
    if (params.isRead !== undefined) {
      queryParams.append('isRead', params.isRead.toString());
    }
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `${API_CONFIG.endpoints.notifications.list}${queryString ? `?${queryString}` : ''}`;
    
    return this.apiService.get<NotificationsListResponse>(url);
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): Observable<number> {
    return this.apiService.get<UnreadCountResponse>(API_CONFIG.endpoints.notifications.unreadCount)
      .pipe(map(response => response.unreadCount));
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: number): Observable<NotificationResponse> {
    const url = API_CONFIG.endpoints.notifications.markAsRead.replace(':id', notificationId.toString());
    return this.apiService.patch<NotificationResponse>(url, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<{ message: string; count: number }> {
    return this.apiService.patch<{ message: string; count: number }>(
      API_CONFIG.endpoints.notifications.markAllAsRead,
      {}
    );
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: number): Observable<{ message: string }> {
    const url = API_CONFIG.endpoints.notifications.delete.replace(':id', notificationId.toString());
    return this.apiService.delete<{ message: string }>(url);
  }
}

