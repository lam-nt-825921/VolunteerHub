// prisma.config.ts (file mới - đặt ở root project)
import 'dotenv/config';  // Load .env tự động
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: './src/prisma/schema.prisma',  // Path đến schema của bạn
  migrations: { path: './src/prisma/migrations' },  // Path migrations
  datasource: { 
    url: env("DATABASE_URL")  // Đọc từ .env - dành cho migrate/studio
  }
});