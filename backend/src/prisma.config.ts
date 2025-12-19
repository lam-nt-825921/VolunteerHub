// prisma.config.ts (file mới - đặt ở root project)
// Tự động load .env.prod nếu NODE_ENV=production
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
require('dotenv').config({ path: envFile });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: './src/prisma/schema.prisma',  // Path đến schema của bạn
  migrations: { path: './src/prisma/migrations' },  // Path migrations
  datasource: { 
    url: env("DATABASE_URL")  // Đọc từ .env hoặc .env.prod - dành cho migrate/studio
  }
});