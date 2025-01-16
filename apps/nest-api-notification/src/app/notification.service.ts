import { Injectable } from '@nestjs/common'

@Injectable()
export class NotificationService {
  execute() {
    return { message: 'Notification API' }
  }
}
