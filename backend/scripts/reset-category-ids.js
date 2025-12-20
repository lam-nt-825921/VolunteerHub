// Script Node.js để reset category IDs về 1,2,3,4
// Chạy: node backend/scripts/reset-category-ids.js

require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('../src/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL không được tìm thấy trong .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetCategoryIds() {
  try {
    console.log('🔄 Bắt đầu reset category IDs...');

    // Bước 1: Lấy tất cả categories hiện tại
    const currentCategories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });

    console.log(`📋 Tìm thấy ${currentCategories.length} categories:`);
    currentCategories.forEach((cat) => {
      console.log(`   - ID ${cat.id}: ${cat.name} (${cat.slug})`);
    });

    // Bước 2: Kiểm tra events đang dùng categories
    const eventsUsingCategories = await prisma.event.findMany({
      where: {
        categoryId: { in: currentCategories.map((c) => c.id) },
      },
      select: { id: true, title: true, categoryId: true },
    });

    if (eventsUsingCategories.length > 0) {
      console.log(`\n⚠️  Có ${eventsUsingCategories.length} events đang sử dụng categories:`);
      eventsUsingCategories.forEach((event) => {
        console.log(`   - Event ID ${event.id}: "${event.title}" -> Category ID ${event.categoryId}`);
      });
      console.log('\n❌ Không thể reset vì có events đang sử dụng categories.');
      console.log('💡 Giải pháp:');
      console.log('   1. Xóa hoặc cập nhật categoryId của các events này trước');
      console.log('   2. Hoặc chạy script reset-category-ids-safe.sql để cập nhật mapping');
      return;
    }

    // Bước 3: Xóa tất cả categories
    console.log('\n🗑️  Xóa tất cả categories...');
    await prisma.category.deleteMany();
    console.log('✅ Đã xóa tất cả categories.');

    // Bước 4: Reset sequence (dùng raw SQL)
    console.log('\n🔄 Reset sequence về 1...');
    await pool.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');
    console.log('✅ Đã reset sequence.');

    // Bước 5: Tạo lại categories với ID từ 1-4
    console.log('\n➕ Tạo lại categories...');
    const newCategories = [
      { name: 'Môi trường', slug: 'moi-truong' },
      { name: 'Giáo dục', slug: 'giao-duc' },
      { name: 'Y tế & Sức khỏe', slug: 'y-te' },
      { name: 'Cứu trợ thiên tai', slug: 'cuu-tro' },
    ];

    for (const cat of newCategories) {
      const created = await prisma.category.create({ data: cat });
      console.log(`   ✅ Tạo category ID ${created.id}: ${created.name}`);
    }

    // Bước 6: Set sequence tiếp theo
    await pool.query('ALTER SEQUENCE categories_id_seq RESTART WITH 5');
    console.log('\n✅ Đã set sequence tiếp theo là 5.');

    console.log('\n🎉 Hoàn thành! Categories đã được reset về ID 1,2,3,4');
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetCategoryIds()
  .then(() => {
    console.log('\n✅ Script hoàn thành.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

