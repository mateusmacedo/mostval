import { Test } from '@nestjs/testing'
import { HttpModule } from '@nestjs/axios'
import { NestjsHealthCheckService } from './nestjs-health-check.service'
import { TerminusModule } from '@nestjs/terminus'

describe('NestjsHealthCheckService', () => {
  let service: NestjsHealthCheckService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TerminusModule,
        HttpModule,
      ],
      providers: [NestjsHealthCheckService],
    }).compile()

    service = module.get(NestjsHealthCheckService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
