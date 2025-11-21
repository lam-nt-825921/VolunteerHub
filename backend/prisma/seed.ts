// prisma/seed.ts
import 'dotenv/config'; // Load .env (nếu cần)
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Tạo adapter giống hệt như trong PrismaService
const adapter = new PrismaBetterSqlite3(
  { url: process.env.DATABASE_URL || 'file:./dev.db' }, // BẮT BUỘC truyền object có url
  { timestampFormat: 'unixepoch-ms' }
);

const ExtendedPrismaClient = PrismaClient; // class đã được generate
const prisma = new ExtendedPrismaClient({ adapter }); // ← ĐÚNG CÚ PHÁP

async function main() {
  const hash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@volunteerhub.com' },
    update: {}, // Không làm gì nếu đã tồn tại
    create: {
      email: 'admin@volunteerhub.com',
      password: hash,
      fullName: 'Super Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Admin đã sẵn sàng!');
  console.log('Email: admin@volunteerhub.com');
  console.log('Pass : admin123');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });