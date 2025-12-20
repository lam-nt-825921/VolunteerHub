// scripts/cleanup-neon.js
// Script đơn giản để xóa tất cả dữ liệu trên Neon PostgreSQL
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load .env.prod
const envPath = path.join(__dirname, '..', '.env.prod');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Loaded environment from: .env.prod');
} else {
  console.warn('⚠️  File .env.prod not found, using system env');
}

// Tạo script cleanup TypeScript tạm thời
const cleanupScript = `
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

if (databaseUrl.startsWith('file:')) {
  console.error('❌ This script is for PostgreSQL (Neon) only.');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanup() {
  console.log('🧹 Bắt đầu xóa dữ liệu trên Neon...');
  console.log(\`   Database: \${databaseUrl.split('@')[1] || 'Neon'}\`);
  
  try {
    // Xóa theo thứ tự ngược lại của quan hệ (Con trước -> Cha sau)
    const deleted = {
      notifications: await prisma.notification.deleteMany(),
      likes: await prisma.like.deleteMany(),
      comments: await prisma.comment.deleteMany(),
      posts: await prisma.post.deleteMany(),
      registrations: await prisma.registration.deleteMany(),
      events: await prisma.event.deleteMany(),
      categories: await prisma.category.deleteMany(),
      users: await prisma.user.deleteMany(),
    };

    console.log('✅ Đã xóa dữ liệu:');
    console.log(\`   - \${deleted.notifications.count} notifications\`);
    console.log(\`   - \${deleted.likes.count} likes\`);
    console.log(\`   - \${deleted.comments.count} comments\`);
    console.log(\`   - \${deleted.posts.count} posts\`);
    console.log(\`   - \${deleted.registrations.count} registrations\`);
    console.log(\`   - \${deleted.events.count} events\`);
    console.log(\`   - \${deleted.categories.count} categories\`);
    console.log(\`   - \${deleted.users.count} users\`);
    console.log('🎉 Xóa dữ liệu hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

cleanup()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
`;

// Ghi script tạm thời
const tempScriptPath = path.join(__dirname, '..', 'prisma', 'cleanup-temp.ts');
fs.writeFileSync(tempScriptPath, cleanupScript);

try {
  console.log('🚀 Đang chạy cleanup script...\n');
  execSync(`npx ts-node ${tempScriptPath}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env },
  });
} catch (error) {
  console.error('❌ Cleanup failed');
  process.exit(1);
} finally {
  // Xóa script tạm thời
  if (fs.existsSync(tempScriptPath)) {
    fs.unlinkSync(tempScriptPath);
  }
}

