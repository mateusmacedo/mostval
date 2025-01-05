import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { NestjsHealthCheckModule } from '@mostval/nestjs-utils'

@Module({
  imports: [
    NestjsHealthCheckModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
