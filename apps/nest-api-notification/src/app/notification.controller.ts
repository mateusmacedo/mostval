import { Body, Controller, Post } from '@nestjs/common';
import { NotificationDto } from './notification.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/')
  async notify(@Body() notificationData: NotificationDto<string>) {
    const notification =
      await this.notificationService.createAndPersistNotification(
        notificationData
      );
    return notification.getValue();
  }
}
