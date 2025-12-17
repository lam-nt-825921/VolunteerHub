// prisma/seed.ts
import 'dotenv/config'; // Load .env (nếu cần)
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { faker } from '@faker-js/faker';

// Tạo adapter giống hệt như trong PrismaService
const adapter = new PrismaBetterSqlite3(
  { url: process.env.DATABASE_URL || 'file:./dev.db' }, // BẮT BUỘC truyền object có url
  { timestampFormat: 'unixepoch-ms' }
);

const ExtendedPrismaClient = PrismaClient; // class đã được generate
const prisma = new ExtendedPrismaClient({ adapter }); // ← ĐÚNG CÚ PHÁP


// Định nghĩa Bitmask quyền hạn (để seed cho chuẩn)
const PERMISSIONS = {
  VIEW: 1,
  POST: 2,
  COMMENT: 4,
  REACT: 8,
  MODERATE: 128, // Quyền quản lý (xóa bài, kick member...)
};
// Mặc định cho member thường: Xem + Đăng bài + Comment + Like
const DEFAULT_MEMBER_MASK = PERMISSIONS.VIEW | PERMISSIONS.POST | PERMISSIONS.COMMENT | PERMISSIONS.REACT;

async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu mẫu (Seeding)...');

  // ==================== 1. CLEANUP (XÓA DỮ LIỆU CŨ) ====================
  // Xóa theo thứ tự ngược lại của quan hệ (Con trước -> Cha sau)
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany(); // Tự động xóa reply nhờ Cascade
  await prisma.post.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🧹 Đã dọn dẹp database cũ.');

  // ==================== 2. TẠO CATEGORY (MỚI) ====================
  const categoryNames = [
    { name: 'Môi trường', slug: 'moi-truong' },
    { name: 'Giáo dục', slug: 'giao-duc' },
    { name: 'Y tế & Sức khỏe', slug: 'y-te' },
    { name: 'Cứu trợ thiên tai', slug: 'cuu-tro' },
    { name: 'Hỗ trợ người già', slug: 'nguoi-gia' },
  ];

  // Lưu lại list categories để dùng cho việc tạo Event sau này
  const categories = [];
  for (const cat of categoryNames) {
    const c = await prisma.category.create({ data: cat });
    categories.push(c);
  }
  console.log(`✅ Đã tạo ${categories.length} danh mục.`);

  // ==================== 3. TẠO USERS ====================
  const passwordHash = await bcrypt.hash('123456', 10);

  // 3.1 Admin
  await prisma.user.create({
    data: {
      email: 'admin@volunteerhub.com',
      password: passwordHash,
      fullName: 'Super Admin',
      role: 'ADMIN',
      avatar: 'https://i.pravatar.cc/150?u=admin',
      reputationScore: 999,
    },
  });

  // 3.2 Manager
  const manager = await prisma.user.create({
    data: {
      email: 'manager@volunteerhub.com',
      password: passwordHash,
      fullName: 'Trưởng Ban Tổ Chức',
      role: 'EVENT_MANAGER',
      phone: '0912345678',
      avatar: 'https://i.pravatar.cc/150?u=manager',
      reputationScore: 500,
    },
  });

  // 3.3 Volunteers (50 người)
  const volunteers = [];
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        fullName: faker.person.fullName(),
        phone: faker.phone.number(),
        role: 'VOLUNTEER',
        avatar: faker.image.avatar(),
        reputationScore: faker.number.int({ min: 0, max: 200 }),
        isActive: true,
      },
    });
    volunteers.push(user);
  }
  console.log(`✅ Đã tạo 1 Admin, 1 Manager và ${volunteers.length} Volunteers.`);

  // ==================== 4. TẠO EVENTS ====================
  const events = [];
  const eventStatuses: any[] = ['APPROVED', 'PENDING', 'COMPLETED', 'CANCELLED'];
  const visibilities: any[] = ['PUBLIC', 'INTERNAL', 'PUBLIC', 'PUBLIC']; // Ưu tiên Public nhiều hơn

  for (let i = 0; i < 20; i++) {
    // Logic thời gian: StartTime trong tương lai gần, Duration 2-8 tiếng
    const startTime = faker.date.soon({ days: 60 });
    const duration = faker.number.float({ min: 2, max: 8, multipleOf: 0.5 }); // VD: 4.5 giờ
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

    const event = await prisma.event.create({
      data: {
        title: faker.helpers.arrayElement([
          'Chiến dịch Mùa Hè Xanh', 'Dọn rác bãi biển Mỹ Khê', 'Hiến máu nhân đạo đợt 1', 
          'Dạy học cho trẻ em vùng cao', 'Phát cháo từ thiện', 'Trồng 1000 cây xanh'
        ]) + ` #${i + 1}`,
        description: faker.lorem.paragraphs(3), // HTML content giả
        location: faker.location.streetAddress({ useFullAddress: true }) + ', Đà Nẵng',
        coverImage: `https://picsum.photos/seed/${i}/800/400`, // Ảnh bìa random đẹp
        
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        
        status: faker.helpers.arrayElement(eventStatuses),
        visibility: faker.helpers.arrayElement(visibilities),
        viewCount: faker.number.int({ min: 50, max: 5000 }),
        
        // Link ngẫu nhiên tới Manager hoặc 5 Volunteer đầu tiên
        creatorId: faker.helpers.arrayElement([manager.id, ...volunteers.slice(0, 5).map(v => v.id)]),
        // Link ngẫu nhiên tới Category
        categoryId: faker.helpers.arrayElement(categories).id,
      },
    });
    events.push(event);
  }
  console.log(`✅ Đã tạo ${events.length} sự kiện.`);

  // ==================== 5. TẠO REGISTRATIONS (ĐĂNG KÝ) ====================
  for (const event of events) {
    // Random 10-40 người tham gia mỗi sự kiện
    const numRegs = faker.number.int({ min: 10, max: 40 });
    const shuffledUsers = [...volunteers].sort(() => 0.5 - Math.random());
    const selectedUsers = shuffledUsers.slice(0, numRegs);

    await prisma.registration.createMany({
      data: selectedUsers.map(user => ({
        userId: user.id,
        eventId: event.id,
        // Nếu event đã xong -> status ATTENDED, chưa xong -> APPROVED
        status: ['COMPLETED', 'APPROVED'].includes(event.status) 
          ? faker.helpers.arrayElement(['APPROVED', 'ATTENDED']) 
          : 'PENDING',
        permissions: DEFAULT_MEMBER_MASK, // Gán quyền cơ bản
        registeredAt: faker.date.recent({ days: 10 }),
      })),
    });
  }
  console.log('✅ Đã tạo các bản ghi đăng ký tham gia.');

  // ==================== 6. TẠO POSTS & COMMENTS & LIKES ====================
  // Chỉ tạo cho các sự kiện đang chạy hoặc đã xong
  const activeEvents = events.filter(e => ['APPROVED', 'COMPLETED'].includes(e.status));

  for (const event of activeEvents) {
    const numPosts = faker.number.int({ min: 2, max: 8 });

    for (let i = 0; i < numPosts; i++) {
      const author = faker.helpers.arrayElement(volunteers);
      
      // Tạo Post
      const post = await prisma.post.create({
        data: {
          content: faker.lorem.paragraph(),
          images: JSON.stringify([faker.image.urlPicsumPhotos()]), // Format mảng JSON string
          type: faker.helpers.arrayElement(['ANNOUNCEMENT', 'DISCUSSION']),
          isPinned: Math.random() < 0.1, // 10% cơ hội được ghim
          authorId: author.id,
          eventId: event.id,
          createdAt: faker.date.recent({ days: 5 }),
        },
      });

      // Tạo Comment gốc (Level 1)
      const numComments = faker.number.int({ min: 0, max: 5 });
      for (let j = 0; j < numComments; j++) {
        const commentAuthor = faker.helpers.arrayElement(volunteers);
        const parentComment = await prisma.comment.create({
          data: {
            content: faker.lorem.sentence(),
            authorId: commentAuthor.id,
            postId: post.id,
            parentId: null, // Comment gốc
          },
        });

        // Tạo Reply (Level 2) - 30% cơ hội có reply
        if (Math.random() > 0.7) {
            await prisma.comment.create({
                data: {
                    content: 'Mình cũng nghĩ vậy! @' + commentAuthor.fullName,
                    authorId: faker.helpers.arrayElement(volunteers).id,
                    postId: post.id,
                    parentId: parentComment.id, // Link vào comment cha
                }
            })
        }
      }

      // Tạo Like
      const numLikes = faker.number.int({ min: 0, max: 20 });
      const likers = faker.helpers.arrayElements(volunteers, numLikes);
      if (likers.length > 0) {
        await prisma.like.createMany({
            data: likers.map(u => ({ userId: u.id, postId: post.id })),
        });
      }
    }
  }

  console.log('🎉🎉🎉 SEEDING HOÀN TẤT! Dữ liệu đã sẵn sàng để test.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });