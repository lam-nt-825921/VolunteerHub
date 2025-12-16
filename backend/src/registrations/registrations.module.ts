import { Module } from '@nestjs/common';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventPermissionsGuard } from '../auth/guards/event-permissions.guard';

@Module({
  imports: [PrismaModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, EventPermissionsGuard],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}

