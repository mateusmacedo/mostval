import { Test } from '@nestjs/testing'
import { NestjsHealthCheckService } from './nestjs-health-check.service'

describe('NestjsHealthCheckService', () => {
  let service: NestjsHealthCheckService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NestjsHealthCheckService],
    }).compile()

    service = module.get(NestjsHealthCheckService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
