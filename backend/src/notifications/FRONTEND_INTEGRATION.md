# Hướng dẫn tích hợp Socket.IO Notifications cho Frontend

## Cách Socket.IO hoạt động

### 1. Khái niệm cơ bản

Socket.IO là một thư viện cho phép **real-time, bidirectional communication** giữa client và server:

- **HTTP REST API**: Client phải **gửi request** → Server trả về response (one-way)
- **Socket.IO**: Server có thể **tự động gửi data** đến client mà không cần client phải hỏi (two-way)

### 2. Flow hoạt động

```
┌─────────────┐                    ┌─────────────┐
│   Frontend  │                    │   Backend   │
│  (Client)   │                    │   (Server)  │
└─────────────┘                    └─────────────┘
      │                                    │
      │  1. Connect với JWT token          │
      │───────────────────────────────────>│
      │                                    │
      │  2. Join room "user:123"          │
      │───────────────────────────────────>│
      │                                    │
      │  3. Connected!                    │
      │<───────────────────────────────────│
      │                                    │
      │                                    │ [Event xảy ra]
      │                                    │ [Tạo notification]
      │                                    │
      │  4. Emit "notification" event      │
      │<───────────────────────────────────│
      │                                    │
      │ [Update UI - hiển thị notification]│
      │                                    │
```

### 3. Các bước tích hợp Frontend

## Bước 1: Cài đặt Socket.IO Client

```bash
npm install socket.io-client
# hoặc
yarn add socket.io-client
```

## Bước 2: Tạo Socket Service (Angular)

Tạo file `src/app/services/socket.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  
  // Subjects để emit events
  private notificationSubject = new Subject<Notification>();
  private unreadCountSubject = new Subject<number>();
  private connectedSubject = new Subject<any>();

  // Observables để components subscribe
  public notification$: Observable<Notification> = this.notificationSubject.asObservable();
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();
  public connected$: Observable<any> = this.connectedSubject.asObservable();

  /**
   * Kết nối Socket.IO với JWT token
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket đã kết nối rồi');
      return;
    }

    this.token = token;

    this.socket = io(`${environment.apiUrl}/notifications`, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    // Lắng nghe khi kết nối thành công
    this.socket.on('connect', () => {
      console.log('✅ Đã kết nối Socket.IO:', this.socket?.id);
    });

    // Lắng nghe khi ngắt kết nối
    this.socket.on('disconnect', () => {
      console.log('❌ Đã ngắt kết nối Socket.IO');
    });

    // Lắng nghe lỗi kết nối
    this.socket.on('connect_error', (error) => {
      console.error('❌ Lỗi kết nối Socket.IO:', error.message);
    });

    // Lắng nghe event "connected" từ server
    this.socket.on('connected', (data) => {
      console.log('✅ Server xác nhận:', data);
      this.connectedSubject.next(data);
    });

    // Lắng nghe notification mới
    this.socket.on('notification', (data: Notification) => {
      console.log('🔔 Notification mới:', data);
      this.notificationSubject.next(data);
    });

    // Lắng nghe unread count update
    this.socket.on('unread_count', (data: { count: number }) => {
      console.log('📊 Unread count:', data.count);
      this.unreadCountSubject.next(data.count);
    });
  }

  /**
   * Ngắt kết nối
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
    }
  }

  /**
   * Yêu cầu unread count từ server
   */
  requestUnreadCount(): void {
    if (!this.socket) {
      console.error('Socket chưa kết nối');
      return;
    }

    this.socket.emit('get_unread_count');
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
```

**File `src/environments/environment.ts`:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## Bước 3: Tạo Notification Service (Angular)

Tạo file `src/app/services/notification.service.ts` để quản lý notifications:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SocketService, Notification } from './socket.service';
import { AuthService } from './auth.service'; // Service quản lý authentication
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  private socketSubscriptions: Subscription[] = [];

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Subscribe khi user login
    this.authService.currentUser$.subscribe(user => {
      if (user && user.token) {
        this.connectSocket(user.token);
      } else {
        this.disconnectSocket();
      }
    });
  }

  /**
   * Kết nối Socket.IO và subscribe các events
   */
  private connectSocket(token: string): void {
    this.socketService.connect(token);

    // Subscribe notification mới
    const notificationSub = this.socketService.notification$.subscribe(notification => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      
      // Tăng unread count
      const currentCount = this.unreadCountSubject.value;
      this.unreadCountSubject.next(currentCount + 1);

      // Hiển thị toast (sử dụng Angular Material Snackbar hoặc ngx-toastr)
      this.showToast(notification);
    });

    // Subscribe unread count update
    const unreadCountSub = this.socketService.unreadCount$.subscribe(count => {
      this.unreadCountSubject.next(count);
    });

    // Request unread count ban đầu
    this.socketService.requestUnreadCount();

    // Lưu subscriptions để cleanup
    this.socketSubscriptions.push(notificationSub, unreadCountSub);
  }

  /**
   * Ngắt kết nối Socket.IO
   */
  private disconnectSocket(): void {
    this.socketSubscriptions.forEach(sub => sub.unsubscribe());
    this.socketSubscriptions = [];
    this.socketService.disconnect();
  }

  /**
   * Load notifications từ API
   */
  loadNotifications(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${environment.apiUrl}/notifications`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Đánh dấu notification là đã đọc
   */
  markAsRead(notificationId: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/notifications/${notificationId}/read`, {});
  }

  /**
   * Đánh dấu tất cả là đã đọc
   */
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/notifications/read-all`, {});
  }

  /**
   * Xóa notification
   */
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/notifications/${notificationId}`);
  }

  /**
   * Hiển thị toast notification
   */
  private showToast(notification: Notification): void {
    // Sử dụng Angular Material Snackbar
    // hoặc ngx-toastr, hoặc thư viện toast khác
    console.log('🔔 Notification:', notification.title, notification.message);
  }

  /**
   * Get current notifications
   */
  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get current unread count
   */
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
}
```

## Bước 4: Tạo Notification Component (Angular)

### Component hiển thị Notification Badge

Tạo file `src/app/components/notification-badge/notification-badge.component.ts`:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="notification-button" (click)="toggleDropdown()">
      <svg class="bell-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span *ngIf="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>
  `,
  styles: [`
    .notification-button {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    .bell-icon {
      width: 24px;
      height: 24px;
    }
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: red;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
  `]
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe unread count
    const sub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown(): void {
    // Mở dropdown notifications
    // Implement logic mở dropdown
  }
}
```

### Component hiển thị Notification List

Tạo file `src/app/components/notification-list/notification-list.component.ts`:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../services/socket.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-list">
      <div *ngFor="let notification of notifications" 
           class="notification-item"
           [class.unread]="!notification.isRead"
           (click)="markAsRead(notification.id)">
        <h4>{{ notification.title }}</h4>
        <p>{{ notification.message }}</p>
        <span class="time">{{ formatDate(notification.createdAt) }}</span>
      </div>
    </div>
  `,
  styles: [`
    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .notification-item {
      padding: 12px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
    }
    .notification-item.unread {
      background-color: #f0f8ff;
    }
    .time {
      font-size: 12px;
      color: #999;
    }
  `]
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Load notifications từ API
    this.loadNotifications();

    // Subscribe notifications mới từ Socket.IO
    const sub = this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(): void {
    this.notificationService.loadNotifications().subscribe({
      next: (response: any) => {
        this.notifications = response.data || response;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        // Update local state
        this.notifications = this.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        );
      },
      error: (error) => {
        console.error('Error marking as read:', error);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('vi-VN');
  }
}
```

### Sử dụng trong App Component

```typescript
// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationBadgeComponent } from './components/notification-badge/notification-badge.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationBadgeComponent, NotificationListComponent],
  template: `
    <header>
      <h1>VolunteerHub</h1>
      <app-notification-badge></app-notification-badge>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  constructor(private notificationService: NotificationService) {
    // Service tự động kết nối khi user login
  }
}
```

## Các Event từ Server

### 1. `connected`
Khi client kết nối thành công:
```typescript
socket.on('connected', (data) => {
  // data = { userId: 123, message: 'Connected to notifications' }
});
```

### 2. `notification`
Khi có notification mới:
```typescript
socket.on('notification', (data) => {
  // data = {
  //   id: 1,
  //   title: 'Sự kiện đã được duyệt',
  //   message: 'Sự kiện "Ngày hội tình nguyện" đã được duyệt',
  //   type: 'EVENT_APPROVED',
  //   isRead: false,
  //   createdAt: '2025-01-15T10:00:00Z',
  //   data: { eventId: 5 }
  // }
});
```

### 3. `unread_count`
Khi unread count thay đổi:
```typescript
socket.on('unread_count', (data) => {
  // data = { count: 5 }
});
```

## Client có thể emit gì?

### `get_unread_count`
Yêu cầu server gửi lại unread count:
```typescript
socket.emit('get_unread_count');
```

## Flow hoàn chỉnh

### Khi user login:
1. Frontend lấy JWT token từ login response
2. Gọi `socketService.connect(token)`
3. Socket.IO tự động kết nối và authenticate
4. Server join user vào room `user:{userId}`
5. Server emit `connected` event
6. Frontend request `get_unread_count` để lấy số notification chưa đọc

### Khi có notification mới:
1. Backend tạo notification trong DB (ví dụ: event được approve)
2. Backend gọi `notificationsGateway.emitNotification(userId, notification)`
3. Server tự động emit `notification` event đến room `user:{userId}`
4. **Frontend tự động nhận được** (không cần gửi request)
5. Frontend update UI: thêm vào danh sách, tăng badge count, hiển thị toast

### Khi user đánh dấu đã đọc:
1. Frontend gọi REST API: `PATCH /notifications/:id/read`
2. Backend update DB và emit `unread_count` event
3. Frontend nhận `unread_count` và update badge

## Lưu ý quan trọng

### 1. Reconnect tự động
Socket.IO tự động reconnect nếu mất kết nối. Nhưng cần xử lý token refresh:

```typescript
socketService.on('disconnect', () => {
  // Nếu token hết hạn, refresh token và reconnect
  if (isTokenExpired()) {
    refreshToken().then((newToken) => {
      socketService.connect(newToken);
    });
  }
});
```

### 2. Multiple tabs
Nếu user mở nhiều tab, mỗi tab sẽ có 1 socket connection riêng. Server sẽ gửi notification đến tất cả các tab.

### 3. Background/Foreground
Khi app ở background, vẫn nhận được notifications. Khi quay lại foreground, có thể request lại unread count.

### 4. Error handling
```typescript
socket.on('connect_error', (error) => {
  if (error.message.includes('token')) {
    // Token không hợp lệ, redirect về login
    router.push('/login');
  }
});
```

## Ví dụ thực tế: Notification Dropdown (Angular)

Tạo file `src/app/components/notification-dropdown/notification-dropdown.component.ts`:

```typescript
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../services/socket.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown-container">
      <button class="dropdown-button" (click)="toggleDropdown()">
        <svg class="bell-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span *ngIf="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>

      <div *ngIf="isOpen" class="dropdown-menu">
        <div class="dropdown-header">
          <h3>Thông báo</h3>
          <button *ngIf="unreadCount > 0" (click)="markAllAsRead()">
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div class="notification-list">
          <div *ngFor="let notification of notifications" 
               class="notification-item"
               [class.unread]="!notification.isRead"
               (click)="markAsRead(notification.id)">
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <span class="time">{{ formatDate(notification.createdAt) }}</span>
            </div>
            <button class="delete-btn" (click)="deleteNotification(notification.id, $event)">
              ×
            </button>
          </div>

          <div *ngIf="notifications.length === 0" class="empty-state">
            Không có thông báo nào
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown-container {
      position: relative;
    }
    .dropdown-button {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    .bell-icon {
      width: 24px;
      height: 24px;
    }
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: red;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      width: 400px;
      max-height: 500px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .dropdown-header {
      padding: 16px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .notification-item {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .notification-item:hover {
      background-color: #f5f5f5;
    }
    .notification-item.unread {
      background-color: #f0f8ff;
    }
    .notification-content {
      flex: 1;
    }
    .notification-content h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
    }
    .notification-content p {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #666;
    }
    .time {
      font-size: 12px;
      color: #999;
    }
    .delete-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 4px 8px;
    }
    .delete-btn:hover {
      color: #f00;
    }
    .empty-state {
      padding: 40px;
      text-align: center;
      color: #999;
    }
  `]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Load notifications từ API
    this.loadNotifications();

    // Subscribe notifications mới
    const notificationSub = this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
    this.subscriptions.push(notificationSub);

    // Subscribe unread count
    const unreadCountSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.push(unreadCountSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.notificationService.loadNotifications(1, 20).subscribe({
      next: (response: any) => {
        this.notifications = response.data || response;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        );
      },
      error: (error) => {
        console.error('Error marking as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation(); // Ngăn trigger markAsRead
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('vi-VN');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isOpen = false;
    }
  }
}
```

## Cài đặt Dependencies

```bash
npm install socket.io-client
# hoặc
ng add socket.io-client
```

## Cấu trúc thư mục Angular

```
src/app/
├── services/
│   ├── socket.service.ts          # Quản lý Socket.IO connection
│   ├── notification.service.ts    # Quản lý notifications business logic
│   └── auth.service.ts            # Quản lý authentication (cần có)
├── components/
│   ├── notification-badge/
│   │   └── notification-badge.component.ts
│   ├── notification-list/
│   │   └── notification-list.component.ts
│   └── notification-dropdown/
│       └── notification-dropdown.component.ts
└── app.component.ts
```

## Tóm tắt

**Socket.IO hoạt động như thế nào:**
1. Client kết nối một lần với JWT token
2. Server tự động gửi events đến client khi có thay đổi
3. Client chỉ cần **subscribe Observable** (`notification$`, `unreadCount$`) - không cần polling
4. Real-time: Notification xuất hiện ngay lập tức, không cần refresh trang

**Angular Frontend cần làm:**
1. Tạo `SocketService` để quản lý Socket.IO connection
2. Tạo `NotificationService` để quản lý notifications và tự động kết nối khi user login
3. Sử dụng RxJS Observables để lắng nghe `notification$` và `unreadCount$`
4. Tạo components để hiển thị notifications
5. Service tự động ngắt kết nối khi user logout

**Lưu ý cho Angular:**
- Sử dụng `providedIn: 'root'` để service là singleton
- Sử dụng RxJS Observables thay vì callbacks
- Cleanup subscriptions trong `ngOnDestroy`
- Sử dụng BehaviorSubject để lưu state
- Tích hợp với Angular Material hoặc ngx-toastr để hiển thị toast

