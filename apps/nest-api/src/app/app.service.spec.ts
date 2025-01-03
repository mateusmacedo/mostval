import { Test } from '@nestjs/testing'

import { AppService, PIPELINE_SYMBOL } from './app.service'
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

  describe('getData', () => {
    it('should return "Hello API"', async () => {
      const result = await service.getData();
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.getValue()).toEqual({ message: 'Hello API' });
    })
  })
})
