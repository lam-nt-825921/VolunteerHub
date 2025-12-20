// src/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventPermissionsGuard } from '../auth/guards/event-permissions.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, NotificationsModule, CloudinaryModule],
  controllers: [PostsController],
  providers: [PostsService, EventPermissionsGuard],
  exports: [PostsService],
})
export class PostsModule {}

