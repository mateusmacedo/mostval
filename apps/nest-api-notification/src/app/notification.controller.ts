import { Controller, Get } from '@nestjs/common'
import { NotificationService } from './notification.service'

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  get() {
    return this.notificationService.execute()
  }
}
