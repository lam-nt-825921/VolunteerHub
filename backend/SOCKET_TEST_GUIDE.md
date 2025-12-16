# Hướng dẫn Test Socket.IO không cần Frontend

Có nhiều cách để test Socket.IO mà không cần frontend:

## Cách 1: Sử dụng Script Node.js (Khuyến nghị)

### Bước 1: Cài đặt dependencies

```bash
cd backend
npm install socket.io-client axios
```

### Bước 2: Chạy script test tự động (tự login)

```bash
# Sửa email/password trong file test-socket-with-login.js
node test-socket-with-login.js
```

Script này sẽ:
1. Tự động login để lấy JWT token
2. Kết nối Socket.IO
3. Lắng nghe notifications và unread count

### Bước 3: Hoặc chạy script với token thủ công

```bash
# 1. Login qua Swagger/Postman để lấy JWT token
# 2. Sửa JWT_TOKEN trong file test-socket.js
node test-socket.js
```

## Cách 2: Sử dụng Postman

1. Mở Postman
2. Tạo request mới → Chọn **WebSocket**
3. URL: `ws://localhost:3000/notifications`
4. Trong **Params**, thêm:
   - Key: `token`
   - Value: `YOUR_JWT_TOKEN`
5. Click **Connect**
6. Sau khi connect, bạn sẽ nhận được event `connected`
7. Gửi message: `get_unread_count` để test
8. Tạo notification từ API khác để test realtime

## Cách 3: Sử dụng Browser Console

1. Mở browser console (F12)
2. Thêm script này:

```javascript
// Load socket.io-client từ CDN
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
document.head.appendChild(script);

// Đợi script load xong
script.onload = () => {
  const socket = io('http://localhost:3000/notifications', {
    auth: {
      token: 'YOUR_JWT_TOKEN_HERE'
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Connected!', socket.id);
    socket.emit('get_unread_count');
  });

  socket.on('notification', (data) => {
    console.log('🔔 Notification:', data);
  });

  socket.on('unread_count', (data) => {
    console.log('📊 Unread count:', data);
  });
};
```

## Cách 4: Sử dụng Online Tools

1. Truy cập: https://amritb.github.io/socketio-client-tool/
2. Nhập:
   - **Server URL**: `http://localhost:3000`
   - **Namespace**: `/notifications`
   - **Auth Token**: `YOUR_JWT_TOKEN`
3. Click **Connect**
4. Lắng nghe events: `notification`, `unread_count`

## Test Flow

### 1. Kết nối Socket.IO
- Script sẽ tự động kết nối và hiển thị Socket ID

### 2. Test Unread Count
- Script tự động emit `get_unread_count` khi connect
- Server sẽ trả về `unread_count` event

### 3. Test Realtime Notification
- Mở terminal khác hoặc Swagger
- Tạo một event mới hoặc đăng ký event
- Script sẽ nhận được notification realtime

### 4. Test từ API
```bash
# Login để lấy token
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'

# Tạo một event để trigger notification
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Test description",
    "location": "Test Location",
    "startTime": "2025-12-31T10:00:00Z",
    "endTime": "2025-12-31T18:00:00Z"
  }'
```

**Lưu ý:** Route login là `/login` (không phải `/auth/login`) vì AuthController dùng `@Controller('')`

## Troubleshooting

### Lỗi: "Cannot find module 'socket.io-client'"
```bash
npm install socket.io-client axios
```

### Lỗi: "Connection refused"
- Kiểm tra server đang chạy: `npm run dev`
- Kiểm tra port: mặc định là 3000

### Lỗi: "Unauthorized" hoặc "Invalid token"
- Kiểm tra JWT token còn hạn không
- Login lại để lấy token mới

### Không nhận được notifications
- Kiểm tra user ID trong token có đúng không
- Kiểm tra notification được tạo cho user đó không
- Xem logs trong server console

## Logs trong Server

Khi test, bạn sẽ thấy logs trong server console:

```
[NotificationsGateway] ✅ User 1 connected (socket: abc123)
[NotificationsGateway] 📨 Emitted notification to user 1 (room: user:1)
[NotificationsGateway] 👋 User 1 disconnected (socket: abc123)
```

