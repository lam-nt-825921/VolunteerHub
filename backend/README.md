# VolunteerHub Backend

Backend API cho hệ thống quản lý hoạt động tình nguyện - VolunteerHub 2025

## 🚀 Quick Start

### Sau khi git clone (Lần đầu tiên)

```bash
cd backend
npm run setup:dev
```

Lệnh này sẽ tự động:
1. ✅ Cài đặt dependencies (`npm install`)
2. ✅ Generate Prisma Client (`prisma generate`)
3. ✅ Chạy migrations (`prisma migrate dev`)
4. ✅ Start dev server (`npm run start:dev`)

### Đã setup rồi, chỉ muốn chạy

```bash
cd backend
npm run dev
```

## 📋 Setup Manual (Nếu cần)

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Setup Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Chạy migrations (tạo database)
npm run prisma:migrate
```

### 3. Seed database (Tùy chọn)

```bash
npm run prisma:seed
```

### 4. Chạy server

```bash
# Development mode (với hot reload)
npm run dev

# Production mode
npm run build
npm run start:prod
```

## 📝 Scripts Available

| Script | Mô tả |
|--------|-------|
| `npm run setup` | Chuẩn bị môi trường (install deps + generate Prisma + migrate) |
| `npm run dev` | Chạy dev server với hot reload |
| `npm run setup:dev` | Setup + chạy dev (cho người mới clone) |
| `npm run build` | Build production |
| `npm run start:prod` | Chạy production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Chạy migrations |
| `npm run prisma:studio` | Mở Prisma Studio (GUI cho database) |
| `npm run prisma:seed` | Seed dữ liệu mẫu |

## 🔧 Environment Variables

Tạo file `.env` trong thư mục `backend/` với các biến sau:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_ACCESS_SECRET=your-access-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Server
PORT=3000

# Cloudinary (Optional - cho upload ảnh)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Lưu ý:** File `.env` không được commit vào git. Xem `.env.example` để biết template.

## 📡 Socket.IO

Backend hỗ trợ Socket.IO cho realtime notifications:

- **Namespace:** `/notifications`
- **Authentication:** JWT token (qua `auth.token` hoặc `query.token`)
- **Port:** Cùng port với HTTP server (mặc định 3000)

Xem `src/notifications/SOCKET_IO_GUIDE.md` để biết chi tiết.

## 🗄️ Database

- **Database:** SQLite (file: `dev.db`)
- **ORM:** Prisma
- **Schema:** `src/prisma/schema.prisma`
- **Migrations:** `src/prisma/migrations/`

### Prisma Studio

Để xem và chỉnh sửa database qua GUI:

```bash
npm run prisma:studio
```

Mở browser tại: `http://localhost:5555`

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication & Authorization
│   ├── users/             # User management
│   ├── events/            # Event management
│   ├── registrations/     # Event registrations
│   ├── posts/             # Posts & Comments
│   ├── notifications/     # Notifications (REST + Socket.IO)
│   ├── prisma/            # Prisma schema & migrations
│   └── common/            # Shared utilities, decorators, guards
├── prisma/
│   └── seed.ts            # Database seed script
├── package.json
└── README.md
```

## 🔐 Authentication

- **JWT Access Token:** 15 phút
- **JWT Refresh Token:** 7 ngày
- **Strategy:** Passport JWT

## 📚 API Documentation

API endpoints được document bằng Swagger (nếu có setup).

## 🐛 Troubleshooting

### Lỗi Prisma Client không tìm thấy

```bash
npm run prisma:generate
```

### Lỗi database không tồn tại

```bash
npm run prisma:migrate
```

### Lỗi port đã được sử dụng

Thay đổi `PORT` trong `.env` hoặc kill process đang dùng port đó.

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Node.js version >= 18
2. Đã cài đặt dependencies chưa (`npm install`)
3. Database đã được migrate chưa (`npm run prisma:migrate`)
4. File `.env` đã được tạo chưa

