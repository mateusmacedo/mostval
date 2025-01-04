import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'

import { AppService, DataItem, DataItemValueObject } from './app.service'
import { lastValueFrom } from 'rxjs'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async executeAppService(): Promise<DataItem> {
    const message = {
      message: 'Execute App Service'
    } as DataItem
    const result = await this.appService.execute(message)
    if (result.isErr()) {
      throw new HttpException(result.getError(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return result.getValue()
  }
}
