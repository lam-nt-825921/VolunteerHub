"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("../src/generated/prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const faker_1 = require("@faker-js/faker");
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' }, { timestampFormat: 'unixepoch-ms' });
const ExtendedPrismaClient = client_1.PrismaClient;
const prisma = new ExtendedPrismaClient({ adapter });
async function main() {
    console.log('Bắt đầu tạo dữ liệu mẫu KHỦNG...');
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
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
    const volunteers = [];
    for (let i = 0; i < 50; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker_1.faker.internet.email(),
                password: await bcrypt.hash('123456', 10),
                fullName: faker_1.faker.person.fullName(),
                phone: '0' + faker_1.faker.string.numeric(9),
                role: 'VOLUNTEER',
                avatar: faker_1.faker.image.avatar(),
            },
        });
        volunteers.push(user);
    }
    const events = [];
    const statuses = ['APPROVED', 'PENDING', 'COMPLETED', 'CANCELLED'];
    for (let i = 0; i < 20; i++) {
        const event = await prisma.event.create({
            data: {
                title: faker_1.faker.helpers.arrayElement([
                    'Dọn rác bãi biển', 'Trồng cây xanh', 'Hiến máu nhân đạo', 'Dạy học cho trẻ em nghèo',
                    'Phát quà từ thiện', 'Làm sạch công viên', 'Hỗ trợ người già', 'Thu gom rác nhựa'
                ]) + ` ${i + 1}`,
                description: faker_1.faker.lorem.paragraphs(2),
                location: faker_1.faker.location.streetAddress({ useFullAddress: true }) + ', Đà Nẵng',
                eventDate: faker_1.faker.date.soon({ days: 60 }),
                maxParticipants: faker_1.faker.number.int({ min: 30, max: 200 }),
                status: faker_1.faker.helpers.arrayElement(statuses),
                thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1737350000/sample_event.jpg',
                creatorId: faker_1.faker.helpers.arrayElement([manager.id, ...volunteers.slice(0, 5).map(v => v.id)]),
            },
        });
        events.push(event);
    }
    for (const event of events) {
        const numRegs = faker_1.faker.number.int({ min: 10, max: 80 });
        const shuffled = [...volunteers].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numRegs);
        await prisma.registration.createMany({
            data: selected.map(user => ({
                userId: user.id,
                eventId: event.id,
                status: event.status === 'APPROVED' || event.status === 'COMPLETED'
                    ? faker_1.faker.helpers.arrayElement(['APPROVED', 'ATTENDED'])
                    : 'PENDING',
            })),
        });
    }
    const activeEvents = events.filter(e => ['APPROVED', 'COMPLETED'].includes(e.status));
    for (const event of activeEvents) {
        const numPosts = faker_1.faker.number.int({ min: 3, max: 12 });
        for (let i = 0; i < numPosts; i++) {
            const author = faker_1.faker.helpers.arrayElement(volunteers);
            const post = await prisma.post.create({
                data: {
                    content: faker_1.faker.lorem.sentences(faker_1.faker.number.int({ min: 1, max: 4 })),
                    images: JSON.stringify(faker_1.faker.helpers.arrayElements([
                        'https://res.cloudinary.com/demo/image/upload/v1737350001/beach1.jpg',
                        'https://res.cloudinary.com/demo/image/upload/v1737350002/tree.jpg',
                        'https://res.cloudinary.com/demo/image/upload/v1737350003/blood.jpg',
                    ], faker_1.faker.number.int({ min: 0, max: 3 }))),
                    type: faker_1.faker.helpers.arrayElement(['ANNOUNCEMENT', 'DISCUSSION']),
                    authorId: author.id,
                    eventId: event.id,
                },
            });
            const numComments = faker_1.faker.number.int({ min: 0, max: 8 });
            for (let j = 0; j < numComments; j++) {
                await prisma.comment.create({
                    data: {
                        content: faker_1.faker.lorem.sentence(),
                        authorId: faker_1.faker.helpers.arrayElement(volunteers).id,
                        postId: post.id,
                    },
                });
            }
            const numLikes = faker_1.faker.number.int({ min: 5, max: 40 });
            const likers = faker_1.faker.helpers.arrayElements(volunteers, numLikes);
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
//# sourceMappingURL=seed.js.map