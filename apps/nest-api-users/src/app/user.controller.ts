import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { ChangeUserCredentialsCommand, TUserCriteria, UserProps } from '@mostval/users'
import { ICredentials } from '@mostval/iam'


export class UserPropsDto implements UserProps {
  [key: string]: unknown
  readonly id: string
  readonly credentials: ICredentials
}

export class UpdateUserCredentialsDto implements ICredentials {
  readonly id: string
  readonly secret: string
}

@Controller('user')
export class UserController {
  constructor(private readonly appService: UserService) {}

  @Post()
  createUser(@Body() user: UserPropsDto) {
    return this.appService.createUser(user)
  }

  @Get()
  findUser(@Query() criteria: TUserCriteria[]) {
    return this.appService.findUser(criteria)
  }

  @Delete()
  deleteUser(@Query() criteria: TUserCriteria[]) {
    return this.appService.deleteUser(criteria)
  }

  @Patch(':id/credentials')
  updateUserCredentials(@Param('id') id: string, @Body() credentials: UpdateUserCredentialsDto) {
    const command = new ChangeUserCredentialsCommand(credentials, {
      id,
      schema: 'user',
      type: 'change-credentials',
      timestamp: Date.now(),
    })
    return this.appService.updateUserCredentials(command)
  }
}
