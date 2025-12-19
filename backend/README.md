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

### Development Scripts

| Script | Mô tả |
|--------|-------|
| `npm run setup` | Chuẩn bị môi trường (install deps + generate Prisma + migrate) |
| `npm run dev` | Chạy dev server với hot reload (dùng `.env`) |
| `npm run setup:dev` | Setup + chạy dev (cho người mới clone) |
| `npm run prisma:migrate` | Chạy migrations trên SQLite (dev) |
| `npm run prisma:studio` | Mở Prisma Studio (SQLite dev database) |
| `npm run prisma:seed` | Seed dữ liệu mẫu vào SQLite |
| `npm run kill:dev` | **Kill process đang chạy trên port 3000** |
| `npm run kill:node` | Kill tất cả process node.exe (cẩn thận!) |

### Production Scripts

| Script | Mô tả |
|--------|-------|
| `npm run prod` | Build + chạy production server (dùng `.env.prod`) |
| `npm run setup:prod` | Setup production (generate + migrate trên Supabase) |
| `npm run prisma:migrate:prod` | Chạy migrations trên PostgreSQL (Supabase) |
| `npm run prisma:studio:prod` | Mở Prisma Studio (PostgreSQL production database) |
| `npm run prisma:seed:prod` | Seed dữ liệu mẫu vào Supabase |
| `npm run build` | Build production |
| `npm run start:prod` | Chạy production server (sau khi build) |

## 🔧 Environment Variables

### Development (`.env`)

Tạo file `.env` trong thư mục `backend/` với các biến sau:

```env
# Database (SQLite cho dev)
DATABASE_URL="file:./dev.db"

# JWT
JWT_ACCESS_SECRET=your-access-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Server
PORT=3001

# Cloudinary (Optional - cho upload ảnh)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Production (`.env.prod`)

Tạo file `.env.prod` với thông tin Supabase:

```env
# Database (PostgreSQL - Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# JWT (Tạo secret keys mạnh cho production!)
JWT_ACCESS_SECRET=your-production-access-secret-key
JWT_REFRESH_SECRET=your-production-refresh-secret-key

# Server
NODE_ENV=production
PORT=3001

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Lưu ý:** 
- File `.env` và `.env.prod` không được commit vào git
- Xem `.env.prod` để biết template cho production
- Xem `scripts/setup-prod.md` để biết cách setup production

## 📡 Socket.IO

Backend hỗ trợ Socket.IO cho realtime notifications:

- **Namespace:** `/notifications`
- **Authentication:** JWT token (qua `auth.token` hoặc `query.token`)
- **Port:** Cùng port với HTTP server (mặc định 3000)

Xem `src/notifications/SOCKET_IO_GUIDE.md` để biết chi tiết.

## 🗄️ Database

- **Development:** SQLite (file: `dev.db`)
- **Production:** PostgreSQL (Supabase) - Tự động detect từ `DATABASE_URL`
- **ORM:** Prisma
- **Schema:** `src/prisma/schema.prisma`
- **Migrations:** `src/prisma/migrations/`

### Database Auto-Detection

Code tự động detect database type từ `DATABASE_URL`:
- `file:./dev.db` → SQLite (Development)
- `postgresql://...` → PostgreSQL (Production/Supabase)

Không cần thay đổi code khi chuyển giữa SQLite và PostgreSQL!

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

## 🚀 Deployment

Xem file [DEPLOYMENT.md](./DEPLOYMENT.md) để biết cách deploy lên **Railway + Supabase** (miễn phí).

### Quick Deploy

1. **Setup Supabase**: Tạo PostgreSQL database
2. **Setup Railway**: Deploy NestJS backend
3. **Set Environment Variables**: `DATABASE_URL`, `JWT_ACCESS_SECRET`, etc.
4. **Deploy**: Railway tự động deploy từ GitHub

Chi tiết: [DEPLOYMENT.md](./DEPLOYMENT.md)

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

**Cách 1: Dùng script (Khuyến nghị)**
```bash
npm run kill:dev
```

**Cách 2: Kill thủ công trên Windows**
```powershell
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay PID bằng số process ID)
taskkill /F /PID <PID>
```

**Cách 3: Kill tất cả Node.js processes (Cẩn thận!)**
```bash
npm run kill:node
```

**Lưu ý:** Trên Windows PowerShell, khi bạn đóng terminal, process có thể vẫn chạy ngầm. Luôn dùng `Ctrl+C` để dừng process trước khi đóng terminal, hoặc dùng `npm run kill:dev` để kill process sau khi đóng terminal.

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Node.js version >= 18
2. Đã cài đặt dependencies chưa (`npm install`)
3. Database đã được migrate chưa (`npm run prisma:migrate`)
4. File `.env` đã được tạo chưa

