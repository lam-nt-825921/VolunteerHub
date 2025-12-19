// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { APP_GUARD } from '@nestjs/core/constants';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { PostsModule } from './posts/posts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      // Tự động load .env.prod nếu NODE_ENV=production, ngược lại load .env
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
      // Cho phép override từ system environment variables
      ignoreEnvFile: false,
    }),
    PrismaModule,
    AuthModule,
    EventsModule,
    UsersModule,
    RegistrationsModule,
    PostsModule,
    NotificationsModule,
    DashboardModule,

  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  
  ],
})
export class AppModule {}