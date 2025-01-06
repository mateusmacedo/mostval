import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { NestjsHealthCheckModule } from '@mostval/nestjs-utils'
import { UserRepositoryProvider } from './user.provider'
import { UserFactoryProvider } from './user.provider'
import { MessageStoreProvider } from './user.provider'

@Module({
  imports: [
    NestjsHealthCheckModule,
  ],
  controllers: [UserController],
  providers: [
    UserFactoryProvider,
    MessageStoreProvider,
    UserRepositoryProvider,
    UserService,
  ],
})
export class UserModule {}
