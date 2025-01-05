import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from './app.controller'
import { AppService, DataItem, PIPELINE_SYMBOL } from './app.service'
import { of, throwError } from 'rxjs'
import { Pipeline } from '@mostval/pipeline'

describe('AppController', () => {
  let app: TestingModule
  let pipeline: jest.Mocked<Pipeline<DataItem, DataItem>>

  beforeAll(async () => {
    pipeline = {
      execute: jest.fn().mockReturnValue(of({ message: 'Execute App Service' }))
    } as unknown as jest.Mocked<Pipeline<DataItem, DataItem>>

    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PIPELINE_SYMBOL, useValue: pipeline }],
    }).compile()
  })

  describe('executeAppService', () => {
    it('should return "Hello API"', async () => {
      const appController = app.get<AppController>(AppController)
      const result = await appController.executeAppService()
      expect(result).toEqual({ message: 'Execute App Service' })
    })

    it('should throw an error if the pipeline fails', async () => {
      pipeline.execute.mockImplementationOnce(() => throwError(() => new Error('Pipeline failed')))
      const appController = app.get<AppController>(AppController)
      await expect(appController.executeAppService()).rejects.toThrow('Pipeline failed')
    })
  })
})
