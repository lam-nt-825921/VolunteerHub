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
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.0.1",
    "engineVersion": "f09f2815f091dbba658cdcd2264306d88bb5bda6",
    "activeProvider": "sqlite",
    "inlineSchema": "// src/prisma/schema.prisma\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../generated/prisma\" // ← quan trọng: generate đúng chỗ\n}\n\ndatasource db {\n  provider = \"sqlite\"\n}\n\n// ==================== ENUMS ====================\nenum Role {\n  VOLUNTEER\n  EVENT_MANAGER\n  ADMIN\n}\n\nenum EventStatus {\n  PENDING\n  APPROVED\n  REJECTED\n  CANCELLED\n  COMPLETED\n}\n\nenum RegistrationStatus {\n  PENDING\n  APPROVED\n  REJECTED\n  ATTENDED // đánh dấu đã tham gia thực tế\n}\n\nenum PostType {\n  ANNOUNCEMENT // thông báo từ quản lý\n  DISCUSSION // bài trao đổi bình thường\n}\n\n// ==================== MODELS ====================\n\nmodel User {\n  id                    Int       @id @default(autoincrement())\n  email                 String    @unique\n  password              String\n  fullName              String\n  avatar                String? // Cloudinary URL\n  phone                 String?\n  role                  Role      @default(VOLUNTEER)\n  isActive              Boolean   @default(true)\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n  refreshToken          String?\n  refreshTokenExpiresAt DateTime?\n\n  // Quan hệ\n  createdEvents Event[]        @relation(\"EventCreator\")\n  registrations Registration[]\n  posts         Post[]\n  comments      Comment[]\n  likes         Like[]\n\n  @@map(\"users\")\n}\n\nmodel Event {\n  id              Int         @id @default(autoincrement())\n  title           String\n  description     String\n  location        String\n  eventDate       DateTime\n  maxParticipants Int?\n  thumbnail       String? // Cloudinary URL\n  status          EventStatus @default(PENDING)\n  createdAt       DateTime    @default(now())\n  updatedAt       DateTime    @updatedAt\n\n  creatorId Int\n  creator   User @relation(\"EventCreator\", fields: [creatorId], references: [id])\n\n  registrations Registration[]\n  posts         Post[]\n\n  @@map(\"events\")\n}\n\nmodel Registration {\n  id           Int                @id @default(autoincrement())\n  status       RegistrationStatus @default(PENDING)\n  registeredAt DateTime           @default(now())\n  attendedAt   DateTime?\n\n  userId  Int\n  eventId Int\n  user    User  @relation(fields: [userId], references: [id])\n  event   Event @relation(fields: [eventId], references: [id])\n\n  @@unique([userId, eventId]) // chống đăng ký trùng\n  @@map(\"registrations\")\n}\n\nmodel Post {\n  id        Int      @id @default(autoincrement())\n  content   String\n  images    String?  @default(\"[]\")\n  type      PostType @default(DISCUSSION)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  authorId Int\n  eventId  Int\n  author   User  @relation(fields: [authorId], references: [id])\n  event    Event @relation(fields: [eventId], references: [id])\n\n  comments Comment[]\n  likes    Like[]\n\n  @@map(\"posts\")\n}\n\nmodel Comment {\n  id        Int      @id @default(autoincrement())\n  content   String\n  createdAt DateTime @default(now())\n\n  authorId Int\n  postId   Int\n  author   User @relation(fields: [authorId], references: [id])\n  post     Post @relation(fields: [postId], references: [id])\n\n  @@map(\"comments\")\n}\n\nmodel Like {\n  id        Int      @id @default(autoincrement())\n  createdAt DateTime @default(now())\n\n  userId Int\n  postId Int\n  user   User @relation(fields: [userId], references: [id])\n  post   Post @relation(fields: [postId], references: [id])\n\n  @@unique([userId, postId])\n  @@map(\"likes\")\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fullName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"avatar\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"refreshToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refreshTokenExpiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdEvents\",\"kind\":\"object\",\"type\":\"Event\",\"relationName\":\"EventCreator\"},{\"name\":\"registrations\",\"kind\":\"object\",\"type\":\"Registration\",\"relationName\":\"RegistrationToUser\"},{\"name\":\"posts\",\"kind\":\"object\",\"type\":\"Post\",\"relationName\":\"PostToUser\"},{\"name\":\"comments\",\"kind\":\"object\",\"type\":\"Comment\",\"relationName\":\"CommentToUser\"},{\"name\":\"likes\",\"kind\":\"object\",\"type\":\"Like\",\"relationName\":\"LikeToUser\"}],\"dbName\":\"users\"},\"Event\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"location\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"eventDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"maxParticipants\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"thumbnail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"EventStatus\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"creatorId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"creator\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"EventCreator\"},{\"name\":\"registrations\",\"kind\":\"object\",\"type\":\"Registration\",\"relationName\":\"EventToRegistration\"},{\"name\":\"posts\",\"kind\":\"object\",\"type\":\"Post\",\"relationName\":\"EventToPost\"}],\"dbName\":\"events\"},\"Registration\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"RegistrationStatus\"},{\"name\":\"registeredAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"attendedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"eventId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"RegistrationToUser\"},{\"name\":\"event\",\"kind\":\"object\",\"type\":\"Event\",\"relationName\":\"EventToRegistration\"}],\"dbName\":\"registrations\"},\"Post\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"images\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"enum\",\"type\":\"PostType\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"authorId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"eventId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"author\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"PostToUser\"},{\"name\":\"event\",\"kind\":\"object\",\"type\":\"Event\",\"relationName\":\"EventToPost\"},{\"name\":\"comments\",\"kind\":\"object\",\"type\":\"Comment\",\"relationName\":\"CommentToPost\"},{\"name\":\"likes\",\"kind\":\"object\",\"type\":\"Like\",\"relationName\":\"LikeToPost\"}],\"dbName\":\"posts\"},\"Comment\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"authorId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"postId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"author\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"CommentToUser\"},{\"name\":\"post\",\"kind\":\"object\",\"type\":\"Post\",\"relationName\":\"CommentToPost\"}],\"dbName\":\"comments\"},\"Like\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"postId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"LikeToUser\"},{\"name\":\"post\",\"kind\":\"object\",\"type\":\"Post\",\"relationName\":\"LikeToPost\"}],\"dbName\":\"likes\"}},\"enums\":{},\"types\":{}}");
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await Promise.resolve().then(() => __importStar(require('node:buffer')));
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await Promise.resolve().then(() => __importStar(require("@prisma/client/runtime/query_compiler_bg.sqlite.js"))),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await Promise.resolve().then(() => __importStar(require("@prisma/client/runtime/query_compiler_bg.sqlite.wasm-base64.js")));
        return await decodeBase64AsWasm(wasm);
    }
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map