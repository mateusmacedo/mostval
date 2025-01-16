import { Test } from '@nestjs/testing'
import { NotificationService } from './notification.service'

describe('NotificationService', () => {
  let service: NotificationService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile()

    service = app.get<NotificationService>(NotificationService)
  })

  describe('execute', () => {
    it('should return "Notification API"', () => {
      expect(service.execute()).toEqual({ message: 'Notification API' })
    })
  })
})
