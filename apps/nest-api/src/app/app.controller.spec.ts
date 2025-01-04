import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from './app.controller'
import { AppService, PIPELINE_SYMBOL } from './app.service'
import { of } from 'rxjs'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PIPELINE_SYMBOL, useValue: {
        execute: jest.fn().mockReturnValue(of({ message: 'Execute App Service' }))
      } }],
    }).compile()
  })

  describe('executeAppService', () => {
    it('should return "Hello API"', async () => {
      const appController = app.get<AppController>(AppController)
      const result = await appController.executeAppService()
      expect(result).toEqual({ message: 'Execute App Service' })
    })
  })
})
