import { Module } from '@nestjs/common'
import { NestjsHealthCheckService } from './nestjs-health-check.service'
import { TerminusModule } from '@nestjs/terminus'
import { NestjsHealthCheckController } from './nestjs-health-check.controller'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [NestjsHealthCheckController],
  providers: [NestjsHealthCheckService],
  exports: [NestjsHealthCheckService],
})
export class NestjsHealthCheckModule {}
