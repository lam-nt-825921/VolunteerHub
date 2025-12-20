import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [NotificationsModule, CloudinaryModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
