import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import {
  CreateNewNotificationProvider,
  NotificationBuilderProvider,
  NotificationPersisterRepositoryProvider,
  PersistNotificationProvider,
} from './notification.provider';
import { NotificationService } from './notification.service';
@Module({
  imports: [],
  controllers: [NotificationController],
  providers: [
    NotificationBuilderProvider,
    CreateNewNotificationProvider,
    NotificationPersisterRepositoryProvider,
    PersistNotificationProvider,
    NotificationService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
