/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { UserModule } from './app/user.module'

async function bootstrap() {
  const app = await NestFactory.create(UserModule)
  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)
  const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`)
}

bootstrap()
