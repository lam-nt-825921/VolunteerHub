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


async function main() {
  console.log('Bắt đầu tạo dữ liệu mẫu KHỦNG...');

  // 1. Xóa dữ liệu cũ (nếu muốn khởi động sạch)
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo Admin + Manager cố định
  const admin = await prisma.user.create({
    data: {
      email: 'admin@volunteerhub.com',
      password: await bcrypt.hash('admin123', 10),
      fullName: 'Super Admin',
      role: 'ADMIN',
      phone: '0905123456',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@volunteerhub.com',
      password: await bcrypt.hash('manager123', 10),
      fullName: 'Quản Lý Sự Kiện',
      role: 'EVENT_MANAGER',
      phone: '0912345678',
    },
  });

  // 3. Tạo 50 tình nguyện viên ngẫu nhiên
  const volunteers = [];
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await bcrypt.hash('123456', 10),
        fullName: faker.person.fullName(),
        phone: '0' + faker.string.numeric(9),
        role: 'VOLUNTEER',
        avatar: faker.image.avatar(),
      },
    });
    volunteers.push(user);
  }

  // 4. Tạo 20 sự kiện (hỗn hợp trạng thái)
  const events = [];
  const statuses: any[] = ['APPROVED', 'PENDING', 'COMPLETED', 'CANCELLED'];
  for (let i = 0; i < 20; i++) {
    const event = await prisma.event.create({
      data: {
        title: faker.helpers.arrayElement([
          'Dọn rác bãi biển', 'Trồng cây xanh', 'Hiến máu nhân đạo', 'Dạy học cho trẻ em nghèo',
          'Phát quà từ thiện', 'Làm sạch công viên', 'Hỗ trợ người già', 'Thu gom rác nhựa'
        ]) + ` ${i + 1}`,
        description: faker.lorem.paragraphs(2),
        location: faker.location.streetAddress({ useFullAddress: true }) + ', Đà Nẵng',
        eventDate: faker.date.soon({ days: 60 }),
        maxParticipants: faker.number.int({ min: 30, max: 200 }),
        status: faker.helpers.arrayElement(statuses),
        thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1737350000/sample_event.jpg',
        creatorId: faker.helpers.arrayElement([manager.id, ...volunteers.slice(0, 5).map(v => v.id)]),
      },
    });
    events.push(event);
  }

  // 5. Tạo đăng ký ngẫu nhiên (300+ bản ghi)
  for (const event of events) {
    const numRegs = faker.number.int({ min: 10, max: 80 });
    const shuffled = [...volunteers].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numRegs);

    await prisma.registration.createMany({
      data: selected.map(user => ({
        userId: user.id,
        eventId: event.id,
        status: event.status === 'APPROVED' || event.status === 'COMPLETED'
          ? faker.helpers.arrayElement(['APPROVED', 'ATTENDED'])
          : 'PENDING',
      })),
    });
  }

  // 6. Tạo post + comment + like cho các sự kiện APPROVED/COMPLETED
  const activeEvents = events.filter(e => ['APPROVED', 'COMPLETED'].includes(e.status));
  for (const event of activeEvents) {
    const numPosts = faker.number.int({ min: 3, max: 12 });
    for (let i = 0; i < numPosts; i++) {
      const author = faker.helpers.arrayElement(volunteers);
      const post = await prisma.post.create({
        data: {
          content: faker.lorem.sentences(faker.number.int({ min: 1, max: 4 })),
          images: JSON.stringify(
            faker.helpers.arrayElements([
              'https://res.cloudinary.com/demo/image/upload/v1737350001/beach1.jpg',
              'https://res.cloudinary.com/demo/image/upload/v1737350002/tree.jpg',
              'https://res.cloudinary.com/demo/image/upload/v1737350003/blood.jpg',
            ], faker.number.int({ min: 0, max: 3 }))
          ),
          type: faker.helpers.arrayElement(['ANNOUNCEMENT', 'DISCUSSION']),
          authorId: author.id,
          eventId: event.id,
        },
      });

      // Comment
      const numComments = faker.number.int({ min: 0, max: 8 });
      for (let j = 0; j < numComments; j++) {
        await prisma.comment.create({
          data: {
            content: faker.lorem.sentence(),
            authorId: faker.helpers.arrayElement(volunteers).id,
            postId: post.id,
          },
        });
      }

      // Like
      const numLikes = faker.number.int({ min: 5, max: 40 });
      const likers = faker.helpers.arrayElements(volunteers, numLikes);
      await prisma.like.createMany({
        data: likers.map(u => ({ userId: u.id, postId: post.id })),
      });
    }
  }

  console.log('HOÀN TẤT TẠO DỮ LIỆU MẪU KHỦNG!');
  console.log(`- ${volunteers.length + 2} người dùng`);
  console.log(`- ${events.length} sự kiện`);
  console.log(`- Hàng trăm đăng ký, post, comment, like`);
  console.log('Mở Prisma Studio để chiêm ngưỡng ngay!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());