# 🚀 Hướng dẫn Deploy lên Railway + Supabase (Miễn phí)

## 📋 Tổng quan

- **Railway**: Host NestJS backend (miễn phí $5 credit/tháng, đủ cho project nhỏ)
- **Supabase**: PostgreSQL database (miễn phí 500MB storage, đủ cho dev/test)

## 🗄️ Bước 1: Setup Supabase Database

### 1.1. Tạo project Supabase

1. Truy cập [https://supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập (dùng GitHub account)
3. Click **"New Project"**
4. Điền thông tin:
   - **Name**: `volunteerhub-db`
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: Chọn gần nhất (Singapore hoặc Tokyo)
5. Click **"Create new project"** (đợi 2-3 phút)

### 1.2. Lấy Connection String

1. Vào **Settings** → **Database**
2. Scroll xuống phần **"Connection string"**
3. Copy **"URI"** (dạng: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
4. Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo
5. **Lưu lại** connection string này (sẽ dùng cho Railway)

### 1.3. Chạy Migrations trên Supabase

**Cách 1: Dùng Supabase SQL Editor (Khuyến nghị)**

1. Vào **SQL Editor** trong Supabase dashboard
2. Copy toàn bộ nội dung từ file `backend/src/prisma/migrations/20251121095758_init_complete_volunteer_system/migration.sql`
3. Paste vào SQL Editor và chạy

**Cách 2: Dùng Prisma CLI (Local)**

```bash
cd backend

# Set DATABASE_URL tạm thời
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Generate Prisma Client cho PostgreSQL
npm run prisma:generate

# Chạy migrations
npx prisma migrate deploy --schema=./src/prisma/schema.prisma
```

---

## 🚂 Bước 2: Setup Railway

### 2.1. Tạo Railway Account

1. Truy cập [https://railway.app](https://railway.app)
2. Đăng ký/Đăng nhập (dùng GitHub account)
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Chọn repository `VolunteerHub` của bạn
5. Railway sẽ tự detect là Node.js project

### 2.2. Cấu hình Environment Variables

Trong Railway dashboard, vào **Variables** tab và thêm:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too

# Cloudinary (nếu dùng upload ảnh)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Node Environment
NODE_ENV=production
PORT=3001

# CORS (cho frontend)
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2.3. Cấu hình Build & Start Commands

Railway tự detect, nhưng bạn có thể kiểm tra trong **Settings**:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

### 2.4. Deploy

1. Railway sẽ tự động deploy khi bạn push code lên GitHub
2. Hoặc click **"Deploy"** trong dashboard
3. Đợi build xong (2-3 phút)
4. Railway sẽ cung cấp URL: `https://your-app.railway.app`

---

## 🔧 Bước 3: Cập nhật Code (Đã tự động)

Code đã được cập nhật để:
- ✅ Tự động detect database type (SQLite cho dev, PostgreSQL cho prod)
- ✅ Hỗ trợ cả SQLite và PostgreSQL
- ✅ Prisma schema đã sẵn sàng cho PostgreSQL

**Không cần thay đổi gì thêm!**

---

## ✅ Bước 4: Kiểm tra Deploy

### 4.1. Test API

```bash
# Health check
curl https://your-app.railway.app

# Swagger docs
# Mở browser: https://your-app.railway.app/api
```

### 4.2. Test Database Connection

1. Vào Railway **Logs** tab
2. Tìm dòng: `✅ Prisma connected to PostgreSQL - Ready!`
3. Nếu thấy lỗi, kiểm tra lại `DATABASE_URL` trong Variables

---

## 🔄 Bước 5: Cập nhật Frontend

Cập nhật frontend để trỏ đến Railway URL:

```typescript
// frontend/src/environments/environment.prod.ts
export const environment = {
  apiUrl: 'https://your-app.railway.app',
  socketUrl: 'https://your-app.railway.app',
};
```

---

## 📊 Monitoring & Logs

### Railway Logs
- Vào Railway dashboard → **Deployments** → Click vào deployment → **Logs**
- Xem real-time logs của server

### Supabase Dashboard
- Vào Supabase → **Table Editor** để xem dữ liệu
- Vào **Database** → **Connection Pooling** để xem stats

---

## 💰 Chi phí (Miễn phí)

### Railway
- **Free tier**: $5 credit/tháng
- **Ước tính**: ~$2-3/tháng cho NestJS app nhỏ
- **Cảnh báo**: Nếu hết credit, app sẽ tạm dừng (có thể upgrade)

### Supabase
- **Free tier**: 500MB database, 2GB bandwidth
- **Đủ cho**: Dev/test và project nhỏ
- **Không giới hạn**: Số lượng projects

---

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to database"
- ✅ Kiểm tra `DATABASE_URL` trong Railway Variables
- ✅ Kiểm tra Supabase project đang **Active** (không bị pause)
- ✅ Kiểm tra password trong connection string

### Lỗi: "Prisma schema mismatch"
- ✅ Chạy migrations: `npx prisma migrate deploy`
- ✅ Hoặc dùng Supabase SQL Editor để chạy migration thủ công

### Lỗi: "Port already in use"
- ✅ Railway tự động set `PORT` env variable
- ✅ Code đã đọc `process.env.PORT` → không cần lo

### App bị sleep sau 1 thời gian không dùng
- ✅ Railway free tier có thể sleep sau 7 ngày không traffic
- ✅ Giải pháp: Dùng [UptimeRobot](https://uptimerobot.com) để ping mỗi 5 phút (miễn phí)

---

## 🚀 Next Steps

1. ✅ Setup custom domain (nếu có)
2. ✅ Setup SSL certificate (Railway tự động)
3. ✅ Setup CI/CD (Railway tự động từ GitHub)
4. ✅ Monitor logs và errors
5. ✅ Backup database định kỳ (Supabase có auto backup)

---

## 📚 Tài liệu tham khảo

- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

