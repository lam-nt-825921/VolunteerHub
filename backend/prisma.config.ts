// prisma.config.ts
// Config file cho Prisma Migrate và Studio
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Tự động load .env.prod nếu NODE_ENV=production
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
require('dotenv').config({ path: envFile });

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
