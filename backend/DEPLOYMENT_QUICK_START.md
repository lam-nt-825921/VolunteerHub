# 🚀 Quick Start: Deploy lên Railway + Supabase

## ⚡ 5 Bước Nhanh

### 1️⃣ Tạo Supabase Database (2 phút)

1. Vào [supabase.com](https://supabase.com) → Đăng ký/Đăng nhập
2. **New Project** → Đặt tên `VolunteerHub`
3. Chọn region gần nhất (Asian)
4. Tạo password mạnh → **Lưu lại!**
5. Đợi project tạo xong (2-3 phút)

### 2️⃣ Lấy Connection String (1 phút)

1. Vào **Settings** → **Database**
2. Scroll xuống **"Connection string"**
3. Copy **"URI"** (dạng: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`)
4. Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo

### 3️⃣ Chạy Migrations trên Supabase (2 phút)

**Cách nhanh nhất:**

1. Vào Supabase → **SQL Editor**
2. Copy toàn bộ nội dung từ: `backend/src/prisma/migrations/20251121095758_init_complete_volunteer_system/migration.sql`
3. Paste vào SQL Editor → Click **Run**

✅ Database đã sẵn sàng!

### 4️⃣ Deploy lên Railway (3 phút)

1. Vào [railway.app](https://railway.app) → Đăng ký/Đăng nhập (GitHub)
2. **New Project** → **Deploy from GitHub repo**
3. Chọn repository `VolunteerHub`
4. Railway tự detect Node.js → Click **Deploy**

### 5️⃣ Cấu hình Environment Variables (2 phút)

Trong Railway dashboard → **Variables** tab → Thêm:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
JWT_ACCESS_SECRET=your-super-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
NODE_ENV=production
PORT=3001
```

**Lưu ý:** Thay `[PASSWORD]` bằng password Supabase của bạn!

### ✅ Xong! 

Railway sẽ tự động deploy và cung cấp URL: `https://your-app.railway.app`

---

## 🧪 Test

```bash
# Health check
curl https://your-app.railway.app

# Swagger docs
# Mở browser: https://your-app.railway.app/api
```

---

## 📚 Chi tiết đầy đủ

Xem [DEPLOYMENT.md](./DEPLOYMENT.md) để biết:
- Troubleshooting
- Monitoring
- Custom domain
- Backup database

---

## 💰 Chi phí

- **Railway**: $5 credit/tháng (miễn phí) → Đủ cho project nhỏ
- **Supabase**: 500MB database (miễn phí) → Đủ cho dev/test

**Tổng: Hoàn toàn miễn phí!** 🎉

