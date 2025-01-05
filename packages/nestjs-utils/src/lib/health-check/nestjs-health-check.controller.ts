import {
  Controller,
  Get
} from '@nestjs/common';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { NestjsHealthCheckService } from './nestjs-health-check.service';


  export interface ICheckEndpoint<T> {
  check(): Promise<T>;
}

@Controller('health')
export class NestjsHealthCheckController implements ICheckEndpoint<HealthCheckResult> {
  constructor(private readonly nestjsHealthCheckService: NestjsHealthCheckService) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.nestjsHealthCheckService.check();
  }
}
