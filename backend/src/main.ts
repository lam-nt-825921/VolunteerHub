// src/main.ts
console.log('=== FILE MAIN.TS ĐANG ĐƯỢC CHẠY ===');
console.log('Nếu thấy dòng này → main.ts đúng');
console.log('Nếu KHÔNG thấy → bạn đang chạy file main.ts khác!');
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // === 3. Cấu hình Swagger ===
  const config = new DocumentBuilder()
    .setTitle('VolunteerHub API')
    .setDescription('Hệ thống quản lý hoạt động tình nguyện - API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('events', 'Event management endpoints')
    .addTag('registrations', 'Event registration endpoints')
    .addTag('posts', 'Post and comment endpoints')
    .addTag('notifications', 'Notification endpoints')
    .addTag('dashboard', 'Dashboard and statistics endpoints')
    .addServer('http://localhost:3000', 'Local development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ token sau khi refresh trang
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // === 4. Lấy PORT từ .env, fallback 3001 (Railway tự động set PORT env variable) ===
  const port = configService.get<number>('PORT') || process.env.PORT || 3001;

  await app.listen(port);

  const logger = new Logger('Bootstrap'); // tên logger tùy ý
  logger.log(`🚀 API Server đang chạy tại: http://localhost:${port}`);
  logger.log(`📚 Swagger Documentation: http://localhost:${port}/api`);
  logger.log(`🌐 Frontend truy cập từ: http://localhost:5000`);
  logger.log(`📍 Base URL: http://localhost:${port}`);
  logger.log(`🔐 Login: http://localhost:${port}/login`);
}

bootstrap();