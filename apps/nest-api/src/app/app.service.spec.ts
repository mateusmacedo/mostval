import { Test } from '@nestjs/testing'

import { AppService, DataItem, PIPELINE_SYMBOL } from './app.service'
import { of } from 'rxjs'

describe('AppService', () => {
  let service: AppService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService, { provide: PIPELINE_SYMBOL, useValue: {
        execute: jest.fn().mockReturnValue(of({ message: 'Hello API' }))
      } }],
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
  })
})
