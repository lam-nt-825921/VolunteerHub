# VolunteerHub

Phát triển ứng dụng web hỗ trợ tổ chức và quản lý các hoạt động tình nguyện (trồng cây, dọn rác, từ thiện, bình dân học vụ số, ...). Hệ thống có các vai trò: tình nguyện viên, quản lý sự kiện, và admin.

## Khởi chạy dự án

### Cài đặt dependencies

```bash
npm install
```

### Chạy Development

**Chạy cả Frontend và Backend cùng lúc:**
```bash
npm run dev
```

**Chạy riêng từng phần:**
```bash
# Chỉ chạy Frontend (port 4200)
npm run dev:frontend

# Chỉ chạy Backend (port 3000)
npm run dev:backend
```

### Build

**Build cả Frontend và Backend:**
```bash
npm run build
```

**Build riêng từng phần:**
```bash
# Build Frontend
npm run build:frontend

# Build Backend
npm run build:backend
```

### Production

**Chạy Production (cả Frontend và Backend):**
```bash
npm run start:prod
```

**Chạy riêng từng phần:**
```bash
# Chạy Frontend production
npm run start:frontend:prod

# Chạy Backend production
npm run start:backend:prod
```

## URLs

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
