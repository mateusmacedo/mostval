import { Test } from '@nestjs/testing'

import { AppService, DataItem, PIPELINE_SYMBOL } from './app.service'
import { of, throwError } from 'rxjs'
import { Pipeline } from '@mostval/pipeline'

describe('AppService', () => {
  let service: AppService
  let pipeline: jest.Mocked<Pipeline<DataItem, DataItem>>

  beforeAll(async () => {
    pipeline = {
      execute: jest.fn().mockReturnValue(of({ message: 'Hello API' }))
    } as unknown as jest.Mocked<Pipeline<DataItem, DataItem>>

    const app = await Test.createTestingModule({
      providers: [AppService, { provide: PIPELINE_SYMBOL, useValue: pipeline }],
    }).compile()

    service = app.get<AppService>(AppService)
  })

  describe('execute', () => {
    it('should return "Hello API"', async () => {
      const message = {
        message: 'Hello API'
      } as DataItem
      const result = await service.execute(message);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.getValue()).toEqual({ message: 'Hello API' });
    })

    it('should return an error if the pipeline fails', async () => {
      const message = {
        message: 'Hello API'
      } as DataItem
      pipeline.execute.mockImplementationOnce(() => throwError(() => new Error('Pipeline failed')))
      const result = await service.execute(message);
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
    })
  })
})
