
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
  console.log(`   Database: ${databaseUrl.split('@')[1] || 'Neon'}`);
  
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
    console.log(`   - ${deleted.notifications.count} notifications`);
    console.log(`   - ${deleted.likes.count} likes`);
    console.log(`   - ${deleted.comments.count} comments`);
    console.log(`   - ${deleted.posts.count} posts`);
    console.log(`   - ${deleted.registrations.count} registrations`);
    console.log(`   - ${deleted.events.count} events`);
    console.log(`   - ${deleted.categories.count} categories`);
    console.log(`   - ${deleted.users.count} users`);
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
