import { Module } from '@nestjs/common';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventPermissionsGuard } from '../auth/guards/event-permissions.guard';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, EventPermissionsGuard],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}

