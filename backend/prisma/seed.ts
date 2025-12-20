// prisma/seed.ts
import 'dotenv/config'; // Load .env tự động
import * as bcrypt from 'bcrypt';
import { PrismaClient, Category } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import { EventPermission, buildPermissions } from '../src/common/utils/event-permissions.util';
import { EventStatus, RegistrationStatus, PostStatus, PostType } from '../src/generated/prisma/enums';

// Tự động detect database type từ DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isSQLite = databaseUrl.startsWith('file:');

// Tạo Prisma Client với adapter phù hợp
let prisma: PrismaClient;
if (isSQLite) {
  // Development: Dùng SQLite với adapter (giống code mẫu)
  const adapter = new PrismaBetterSqlite3(
    { url: databaseUrl }, // BẮT BUỘC truyền object có url
    { timestampFormat: 'unixepoch-ms' }
  );
  const ExtendedPrismaClient = PrismaClient; // class đã được generate
  prisma = new ExtendedPrismaClient({ adapter }); // ← ĐÚNG CÚ PHÁP
  console.log('✅ Seeding SQLite database...');
} else {
  // Production: Dùng PostgreSQL (Supabase) với adapter pg
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const ExtendedPrismaClient = PrismaClient;
  prisma = new ExtendedPrismaClient({ adapter });
  console.log('✅ Seeding PostgreSQL database...');
  console.log(`   Database: ${databaseUrl.split('@')[1] || 'Neon'}`);
}

// Quyền đầy đủ cho Creator (tự động khi tạo event)
const CREATOR_PERMISSIONS = buildPermissions([
  EventPermission.POST_CREATE,
  EventPermission.POST_APPROVE,
  EventPermission.POST_REMOVE_OTHERS,
  EventPermission.COMMENT_DELETE_OTHERS,
  EventPermission.REGISTRATION_APPROVE,
  EventPermission.REGISTRATION_KICK,
  EventPermission.MANAGE_DELEGATION,
]);

// Quyền mặc định cho Volunteer thường
const DEFAULT_VOLUNTEER_PERMISSIONS = buildPermissions([
  EventPermission.POST_CREATE, // Có thể đăng bài
]);

// Quyền cho Volunteer có quyền cao hơn (moderator)
const MODERATOR_PERMISSIONS = buildPermissions([
  EventPermission.POST_CREATE,
  EventPermission.POST_APPROVE, // Có thể duyệt post
  EventPermission.REGISTRATION_APPROVE, // Có thể duyệt đăng ký
]);

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

  // ==================== 2. TẠO CATEGORIES ====================
  const categoryNames = [
    { name: 'Môi trường', slug: 'moi-truong' },
    { name: 'Giáo dục', slug: 'giao-duc' },
    { name: 'Y tế & Sức khỏe', slug: 'y-te' },
    { name: 'Cứu trợ thiên tai', slug: 'cuu-tro' },
    { name: 'Hỗ trợ người già', slug: 'nguoi-gia' },
  ];

  const categories: Category[] = [];
  for (const cat of categoryNames) {
    const c = await prisma.category.create({ data: cat });
    categories.push(c);
  }
  console.log(`✅ Đã tạo ${categories.length} danh mục.`);

  // ==================== 3. TẠO USERS ====================
  const passwordHash = await bcrypt.hash('123456', 10);

  // 3.1 Admin (1 user)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@volunteerhub.com',
      password: passwordHash,
      fullName: 'Super Admin',
      role: 'ADMIN',
      avatar: 'https://i.pravatar.cc/150?u=admin',
      reputationScore: 999,
    },
  });
  console.log('✅ Đã tạo 1 Admin.');

  // 3.2 Event Managers (3 users)
  const managers = [];
  for (let i = 1; i <= 3; i++) {
    const manager = await prisma.user.create({
      data: {
        email: `manager${i}@volunteerhub.com`,
        password: passwordHash,
        fullName: `Trưởng Ban Tổ Chức ${i}`,
        role: 'EVENT_MANAGER',
        phone: `091234567${i}`,
        avatar: `https://i.pravatar.cc/150?u=manager${i}`,
        reputationScore: 400 + i * 50,
      },
    });
    managers.push(manager);
  }
  console.log(`✅ Đã tạo ${managers.length} Event Managers.`);

  // 3.3 Volunteers (20 users)
  const volunteers = [];
  for (let i = 0; i < 20; i++) {
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
  console.log(`✅ Đã tạo ${volunteers.length} Volunteers.`);

  // ==================== 4. TẠO EVENTS ====================
  // Chỉ EVENT_MANAGER và ADMIN có thể tạo events
  const eventCreators = [...managers, admin];
  const events = [];
  
  // Phân bổ events cho các creators
  // Mỗi manager tạo 3-4 events, admin tạo 1-2 events
  let eventIndex = 0;
  
  for (const creator of managers) {
    const numEvents = faker.number.int({ min: 3, max: 4 });
    for (let i = 0; i < numEvents; i++) {
      const startTime = faker.date.soon({ days: 60 });
      const duration = faker.number.float({ min: 2, max: 8, multipleOf: 0.5 });
      const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

      // Tạo event và registration cho creator trong cùng transaction
      const event = await prisma.$transaction(async (tx) => {
        const newEvent = await tx.event.create({
          data: {
            title: faker.helpers.arrayElement([
              'Chiến dịch Mùa Hè Xanh',
              'Dọn rác bãi biển Mỹ Khê',
              'Hiến máu nhân đạo đợt 1',
              'Dạy học cho trẻ em vùng cao',
              'Phát cháo từ thiện',
              'Trồng 1000 cây xanh',
              'Hỗ trợ người già neo đơn',
              'Tình nguyện tại bệnh viện',
            ]) + ` #${eventIndex + 1}`,
            description: faker.lorem.paragraphs(3),
            location: faker.location.streetAddress({ useFullAddress: true }) + ', Đà Nẵng',
            coverImage: `https://picsum.photos/seed/${eventIndex}/800/400`,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            status: faker.helpers.arrayElement([
              EventStatus.APPROVED,
              EventStatus.APPROVED,
              EventStatus.APPROVED, // 60% APPROVED
              EventStatus.PENDING,
              EventStatus.COMPLETED,
              EventStatus.REJECTED,
              EventStatus.CANCELLED,
            ]),
            visibility: faker.helpers.arrayElement([
              'PUBLIC',
              'PUBLIC',
              'PUBLIC', // 70% PUBLIC
              'INTERNAL',
              'INTERNAL', // 20% INTERNAL
              'PRIVATE', // 10% PRIVATE
            ]),
            viewCount: faker.number.int({ min: 50, max: 5000 }),
            creatorId: creator.id,
            categoryId: faker.helpers.arrayElement(categories).id,
          },
        });

        // Tự động tạo registration cho creator với quyền đầy đủ
        await tx.registration.create({
          data: {
            userId: creator.id,
            eventId: newEvent.id,
            status: RegistrationStatus.APPROVED,
            permissions: CREATOR_PERMISSIONS,
          },
        });

        return newEvent;
      });

      events.push(event);
      eventIndex++;
    }
  }

  // Admin tạo 1-2 events
  const adminNumEvents = faker.number.int({ min: 1, max: 2 });
  for (let i = 0; i < adminNumEvents; i++) {
    const startTime = faker.date.soon({ days: 60 });
    const duration = faker.number.float({ min: 2, max: 8, multipleOf: 0.5 });
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

    const event = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          title: faker.helpers.arrayElement([
            'Chiến dịch Mùa Hè Xanh',
            'Dọn rác bãi biển Mỹ Khê',
            'Hiến máu nhân đạo đợt 1',
            'Dạy học cho trẻ em vùng cao',
            'Phát cháo từ thiện',
            'Trồng 1000 cây xanh',
          ]) + ` #${eventIndex + 1}`,
          description: faker.lorem.paragraphs(3),
          location: faker.location.streetAddress({ useFullAddress: true }) + ', Đà Nẵng',
          coverImage: `https://picsum.photos/seed/${eventIndex}/800/400`,
          startTime: startTime,
          endTime: endTime,
          duration: duration,
          status: EventStatus.APPROVED,
          visibility: 'PUBLIC',
          viewCount: faker.number.int({ min: 50, max: 5000 }),
          creatorId: admin.id,
          categoryId: faker.helpers.arrayElement(categories).id,
        },
      });

      await tx.registration.create({
        data: {
          userId: admin.id,
          eventId: newEvent.id,
          status: RegistrationStatus.APPROVED,
          permissions: CREATOR_PERMISSIONS,
        },
      });

      return newEvent;
    });

    events.push(event);
    eventIndex++;
  }

  console.log(`✅ Đã tạo ${events.length} sự kiện.`);

  // ==================== 5. TẠO REGISTRATIONS ====================
  // Chỉ tạo registrations cho events APPROVED hoặc COMPLETED
  const eligibleEvents = events.filter(
    (e) => e.status === EventStatus.APPROVED || e.status === EventStatus.COMPLETED
  );

  for (const event of eligibleEvents) {
    // Lấy creator ID để tránh tạo lại registration
    const creatorId = event.creatorId;

    // Random 5-25 volunteers đăng ký mỗi event
    const numRegs = faker.number.int({ min: 5, max: 25 });
    const shuffledVolunteers = [...volunteers].sort(() => 0.5 - Math.random());
    const selectedVolunteers = shuffledVolunteers.slice(0, numRegs);

    const registrations = [];
    for (const volunteer of selectedVolunteers) {
      // Xác định status dựa trên event status
      let status: RegistrationStatus;
      if (event.status === EventStatus.COMPLETED) {
        // Event đã hoàn thành
        status = faker.helpers.arrayElement([
          RegistrationStatus.ATTENDED,
          RegistrationStatus.ATTENDED,
          RegistrationStatus.ATTENDED, // 80% ATTENDED
          RegistrationStatus.APPROVED,
          RegistrationStatus.LEFT, // 5% LEFT
        ]);
      } else {
        // Event APPROVED
        status = faker.helpers.arrayElement([
          RegistrationStatus.APPROVED,
          RegistrationStatus.APPROVED,
          RegistrationStatus.APPROVED, // 70% APPROVED
          RegistrationStatus.PENDING,
          RegistrationStatus.ATTENDED, // 10% ATTENDED (đã điểm danh)
        ]);
      }

      // Xác định permissions
      // 10-20% volunteers có quyền moderator
      const isModerator = Math.random() < 0.15;
      const permissions = isModerator
        ? MODERATOR_PERMISSIONS
        : DEFAULT_VOLUNTEER_PERMISSIONS;

      registrations.push({
        userId: volunteer.id,
        eventId: event.id,
        status: status,
        permissions: permissions,
        registeredAt: faker.date.recent({ days: 10 }),
        attendedAt:
          status === RegistrationStatus.ATTENDED
            ? faker.date.recent({ days: 2 })
            : null,
      });
    }

    await prisma.registration.createMany({ data: registrations });
  }

  console.log('✅ Đã tạo các bản ghi đăng ký tham gia.');

  // ==================== 6. TẠO POSTS ====================
  // Chỉ tạo posts cho events APPROVED hoặc COMPLETED
  const activeEvents = events.filter(
    (e) => e.status === EventStatus.APPROVED || e.status === EventStatus.COMPLETED
  );

  for (const event of activeEvents) {
    // Lấy danh sách users đã đăng ký event với status APPROVED hoặc ATTENDED
    const registrations = await prisma.registration.findMany({
      where: {
        eventId: event.id,
        status: {
          in: [RegistrationStatus.APPROVED, RegistrationStatus.ATTENDED],
        },
      },
      include: { user: true },
    });

    if (registrations.length === 0) continue;

    // Lọc chỉ những users có quyền POST_CREATE hoặc là creator
    const eligibleRegistrations = registrations.filter((reg) => {
      const isCreator = reg.userId === event.creatorId;
      const hasPostCreate =
        (reg.permissions & EventPermission.POST_CREATE) ===
        EventPermission.POST_CREATE;
      return isCreator || hasPostCreate;
    });

    if (eligibleRegistrations.length === 0) continue;

    // Mỗi event có 3-10 posts
    const numPosts = faker.number.int({ min: 3, max: 10 });

    for (let i = 0; i < numPosts; i++) {
      // Chọn author từ danh sách có quyền POST_CREATE
      const registration = faker.helpers.arrayElement(eligibleRegistrations);
      const author = registration.user;

      // Xác định post status
      // Nếu author có POST_APPROVE hoặc là creator → APPROVED
      const hasPostApprove =
        author.id === event.creatorId ||
        (registration.permissions & EventPermission.POST_APPROVE) ===
          EventPermission.POST_APPROVE;

      const postStatus = hasPostApprove
        ? PostStatus.APPROVED
        : faker.helpers.arrayElement([PostStatus.APPROVED, PostStatus.PENDING]);

      // Tạo Post
      const post = await prisma.post.create({
        data: {
          content: faker.lorem.paragraph(),
          images: JSON.stringify([faker.image.urlPicsumPhotos()]),
          type:
            i === 0 && Math.random() < 0.2
              ? PostType.ANNOUNCEMENT
              : PostType.DISCUSSION, // 20% ANNOUNCEMENT
          status: postStatus,
          isPinned: i === 0 && Math.random() < 0.1, // 10% được ghim
          authorId: author.id,
          eventId: event.id,
          createdAt: faker.date.recent({ days: 5 }),
        },
      });

      // Chỉ tạo comments và likes cho posts APPROVED
      if (post.status === PostStatus.APPROVED) {
        // ==================== 7. TẠO COMMENTS ====================
        const numComments = faker.number.int({ min: 0, max: 8 });
        const commentAuthors = faker.helpers.arrayElements(
          registrations,
          Math.min(numComments, registrations.length)
        );

        for (const commentReg of commentAuthors) {
          const parentComment = await prisma.comment.create({
            data: {
              content: faker.lorem.sentence(),
              authorId: commentReg.userId,
              postId: post.id,
              parentId: null, // Comment gốc
            },
          });

          // 30% cơ hội có reply
          if (Math.random() < 0.3) {
            const replyAuthor = faker.helpers.arrayElement(registrations);
            await prisma.comment.create({
              data: {
                content: `Mình cũng nghĩ vậy! @${commentReg.user.fullName}`,
                authorId: replyAuthor.userId,
                postId: post.id,
                parentId: parentComment.id, // Link vào comment cha
              },
            });
          }
        }

        // ==================== 8. TẠO LIKES ====================
        const numLikes = faker.number.int({
          min: 0,
          max: Math.min(15, registrations.length),
        });
        const likers = faker.helpers.arrayElements(
          registrations,
          numLikes
        );

        if (likers.length > 0) {
          await prisma.like.createMany({
            data: likers.map((reg) => ({
              userId: reg.userId,
              postId: post.id,
            })),
            skipDuplicates: true, // Tránh duplicate nếu có
          });
        }
      }
    }
  }

  console.log('✅ Đã tạo Posts, Comments và Likes.');

  // ==================== 9. TẠO NOTIFICATIONS (Tùy chọn) ====================
  // Tạo một số notifications mẫu
  const allUsers = [admin, ...managers, ...volunteers];
  const notificationTypes = [
    'EVENT_INVITE',
    'NEW_POST',
    'NEW_COMMENT',
    'REGISTRATION_APPROVED',
    'SYSTEM',
  ];

  for (let i = 0; i < 30; i++) {
    const user = faker.helpers.arrayElement(allUsers);
    const type = faker.helpers.arrayElement(notificationTypes);
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        message: faker.lorem.paragraph(),
        type: type,
        data: JSON.stringify({ eventId: faker.helpers.arrayElement(events).id }),
        isRead: Math.random() < 0.3, // 30% đã đọc
        createdAt: faker.date.recent({ days: 7 }),
      },
    });
  }

  console.log('✅ Đã tạo Notifications.');

  console.log('🎉🎉🎉 SEEDING HOÀN TẤT! Dữ liệu đã sẵn sàng để test.');
  console.log('\n📊 Tóm tắt:');
  console.log(`   - 1 Admin: admin@volunteerhub.com`);
  console.log(`   - 3 Event Managers: manager1@volunteerhub.com, manager2@volunteerhub.com, manager3@volunteerhub.com`);
  console.log(`   - 20 Volunteers`);
  console.log(`   - ${events.length} Events`);
  console.log(`   - Password mặc định cho tất cả: 123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
