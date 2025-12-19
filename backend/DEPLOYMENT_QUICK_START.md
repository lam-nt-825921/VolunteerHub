# 🚀 Quick Start: Deploy lên Supabase + Render (Backend) + Vercel/Netlify (Frontend)

## ⚡ Tổng quan

- **Database:** Supabase PostgreSQL (free)
- **Backend:** Render Web Service (NestJS backend, free tier)
- **Frontend:** Vercel hoặc Netlify (Angular build, free)

Mục tiêu:  
- Backend NestJS (`backend/`) chạy trên Render, kết nối Supabase  
- Frontend Angular (`frontend/volunteerhub-frontend/`) chạy trên Vercel/Netlify và gọi API Render

---

## 1️⃣ Tạo Supabase Database (2 phút)

1. Vào [supabase.com](https://supabase.com) → Đăng ký/Đăng nhập
2. **New Project** → Đặt tên `VolunteerHub`
3. Chọn region gần nhất (Asian)
4. Tạo password mạnh → **Lưu lại!**
5. Đợi project tạo xong (2–3 phút)

### Lấy Connection String

1. Vào **Settings** → **Database**
2. Kéo xuống **"Connection string"**
3. Copy **"URI"** dạng:
   `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
4. Thay `[PASSWORD]` bằng password bạn đã tạo  
5. Lưu lại string này để dùng cho backend (Render)

### Chạy Migrations trên Supabase (chỉ cần làm 1 lần)

**Cách nhanh nhất:**

1. Vào Supabase → **SQL Editor**
2. Mở file: `backend/src/prisma/migrations/20251121095758_init_complete_volunteer_system/migration.sql`
3. Copy toàn bộ nội dung SQL
4. Paste vào SQL Editor → Click **Run**

✅ Database schema đã sẵn sàng trên Supabase.

---

## 2️⃣ Deploy Backend lên Render (NestJS + Supabase)

### Chuẩn bị repo

Code backend đã sẵn trong thư mục `backend/` với:

- `npm run build` → build NestJS
- `npm run start:prod` → chạy server production (đọc env)

Hãy đảm bảo code đã push lên GitHub (branch `main`).

### Tạo Web Service trên Render

1. Vào [render.com](https://render.com) → Đăng ký/Đăng nhập (GitHub)
2. **New** → **Web Service**
3. **Connect GitHub** → chọn repository `VolunteerHub`
4. Branch: `main`

### Cấu hình service

Trong bước cấu hình service:

- **Name**: `volunteerhub-backend` (tuỳ ý)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**:

```bash
npm install && npm run build
```

- **Start Command**:

```bash
npm run start:prod
```

### Environment Variables trên Render

Trong tab **Environment** của service, thêm:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
JWT_ACCESS_SECRET=your-super-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
NODE_ENV=production
PORT=3000
```

**Lưu ý:**

- Thay `[PASSWORD]` bằng password Supabase
- `PORT` là port Render sẽ dùng cho backend (Render tự map ra HTTP public)

### Deploy

1. Click **Create Web Service**
2. Render sẽ:
   - Clone repo
   - Chạy `npm install --include=dev && npm run build` trong `backend/`
   - Chạy `npm run start:prod`
3. Sau khi xong, Render cung cấp URL dạng:

```text
https://volunteerhub-backend.onrender.com
```

Đây là **base URL cho API backend**.

---

## 3️⃣ Deploy Frontend Angular lên Vercel/Netlify

Giả sử frontend nằm trong: `frontend/volunteerhub-frontend/`

### Cập nhật cấu hình API URL trong Angular

Trong `frontend/volunteerhub-frontend/src/environments/environment.prod.ts`:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://volunteerhub-backend.onrender.com', // URL backend Render
  socketUrl: 'https://volunteerhub-backend.onrender.com', // Socket.IO nếu dùng chung domain
};
```

Commit & push thay đổi này.

### Option A: Deploy lên Vercel

1. Vào [vercel.com](https://vercel.com) → Đăng ký/Đăng nhập (GitHub)
2. **New Project** → Import repo `VolunteerHub`
3. **Root Directory**: chọn `frontend/volunteerhub-frontend`
4. **Framework Preset**: Angular
5. **Build Command**:

```bash
npm install && npm run build
```

6. **Output Directory**:

```text
dist/volunteerhub-frontend
```

7. Deploy → Vercel trả URL dạng:

```text
https://volunteerhub-frontend.vercel.app
```

Frontend sẽ gọi API sang URL backend Render đã set trong `environment.prod.ts`.

### Option B: Deploy lên Netlify

1. Vào [netlify.com](https://www.netlify.com/) → Đăng ký/Đăng nhập
2. **Add New Site** → **Import from Git**
3. Chọn repo `VolunteerHub`
4. **Base directory**: `frontend/volunteerhub-frontend`
5. **Build command**:

```bash
npm run build
```

6. **Publish directory**:

```text
dist/volunteerhub-frontend
```

7. Deploy → Netlify trả URL dạng:

```text
https://volunteerhub-frontend.netlify.app
```

---

## 4️⃣ Test nhanh

### Backend (Render)

```bash
# Health check
curl https://volunteerhub-backend.onrender.com
```

Mở Swagger:

```text
https://volunteerhub-backend.onrender.com/api
```

### Frontend (Vercel/Netlify)

- Mở URL FE (Vercel/Netlify) trên browser
- Thử login, gọi API → nếu env đã set đúng thì FE sẽ gọi được backend Render

---

## 5️⃣ Chi phí (tất cả đều free tier)

- **Supabase**: 500MB PostgreSQL database miễn phí → đủ cho dev/test + demo
- **Render**: Free Web Service tier → đủ cho backend NestJS nhỏ
- **Vercel/Netlify**: Free tier cho static site (Angular build) → đủ cho đồ án / demo

👉 Tổng thể: **deploy full FE + BE hoàn toàn miễn phí** (với giới hạn free tier).


