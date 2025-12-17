# Socket.IO Notifications Guide

## Tổng quan

Socket.IO được sử dụng để push notifications realtime đến client khi có notification mới được tạo.

## Cấu trúc

- **`notifications.gateway.ts`**: Gateway xử lý WebSocket connections
- **`notifications.service.ts`**: Service tạo notifications và tự động emit qua gateway
- **Namespace**: `/notifications`

## Authentication

Client phải authenticate bằng JWT token khi connect:

```typescript
// Frontend example
const socket = io('http://localhost:3000/notifications', {
  auth: {
    token: 'your-jwt-access-token'
  },
  // Hoặc có thể dùng query string
  query: {
    token: 'your-jwt-access-token'
  }
});
```

## Events

### Client → Server

#### `get_unread_count`
Lấy số lượng notifications chưa đọc:

```typescript
socket.emit('get_unread_count');
socket.on('unread_count', (data) => {
  console.log('Unread count:', data.count);
});
```

### Server → Client

#### `connected`
Emit khi client kết nối thành công:

```typescript
socket.on('connected', (data) => {
  console.log('Connected as user:', data.userId);
});
```

#### `notification`
Emit khi có notification mới:

```typescript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // notification: {
  //   id: number,
  //   title: string,
  //   message: string,
  //   type: string,
  //   data: object | null,
  //   isRead: boolean,
  //   createdAt: Date
  // }
});
```

#### `unread_count`
Emit khi số lượng unread count thay đổi:

```typescript
socket.on('unread_count', (data) => {
  console.log('Unread count updated:', data.count);
});
```

## Flow hoạt động

1. **Client connect** → Gateway authenticate bằng JWT → Join room `user:{userId}`
2. **Service tạo notification** → `NotificationsService.createNotification()` → Tự động emit qua gateway
3. **Gateway emit** → Gửi đến room `user:{userId}` → Client nhận notification realtime
4. **Client mark as read** → REST API `/notifications/:id/read` → Gateway emit unread_count update

## Room Structure

Mỗi user được join vào room riêng: `user:{userId}`

Ví dụ:
- User ID 1 → Room: `user:1`
- User ID 2 → Room: `user:2`

## Frontend Integration Example

```typescript
import { io, Socket } from 'socket.io-client';

class NotificationSocket {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('http://localhost:3000/notifications', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connected', (data) => {
      console.log('✅ Connected to notifications');
    });

    this.socket.on('notification', (notification) => {
      // Hiển thị notification trong UI
      this.showNotification(notification);
    });

    this.socket.on('unread_count', (data) => {
      // Cập nhật badge số lượng unread
      this.updateUnreadBadge(data.count);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from notifications');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getUnreadCount() {
    if (this.socket) {
      this.socket.emit('get_unread_count');
    }
  }
}
```

## Testing

1. Start backend server
2. Login để lấy JWT token
3. Connect Socket.IO với token
4. Tạo notification từ service khác (Events, Registrations, Posts)
5. Kiểm tra client nhận được notification realtime

