// src/main.ts
console.log('=== FILE MAIN.TS ĐANG ĐƯỢC CHẠY ===');
console.log('Nếu thấy dòng này → main.ts đúng');
console.log('Nếu KHÔNG thấy → bạn đang chạy file main.ts khác!');
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lấy ConfigService từ app (phải sau khi create app)
  const configService = app.get(ConfigService);

  // === 1. Validation toàn cục (giữ nguyên, rất tốt) ===
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false, // dev thì để false cho dễ debug
    }),
  );

  // === 2. Cấu hình CORS cho frontend chạy port 5000 ===
  app.enableCors({
    origin: [
      'http://localhost:5000',     // ← Frontend chính của bạn
      'http://127.0.0.1:5000',
      // Nếu sau này deploy thì thêm domain thật ở đây
    ],
    credentials: true, // cần nếu dùng cookie/session (auth jwt với httpOnly cookie)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  });



  // === 4. Lấy PORT từ .env, fallback 3000 ===
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  const logger = new Logger('Bootstrap'); // tên logger tùy ý
  logger.log(`🚀 API Server đang chạy tại: http://localhost:${port}`);
  logger.log(`🌐 Frontend truy cập từ: http://localhost:5000`);
  logger.log(`📍 Base URL: http://localhost:${port}`);
  logger.log(`🔐 Login: http://localhost:${port}/auth/login`);
}

bootstrap();