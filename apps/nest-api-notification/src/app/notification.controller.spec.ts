import { Test, TestingModule } from '@nestjs/testing'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

describe('NotificationController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile()
  })

  describe('getData', () => {
    it('should return "Notification API"', () => {
      const appController = app.get<NotificationController>(NotificationController)
      expect(appController.get()).toEqual({ message: 'Notification API' })
    })
  })
})
