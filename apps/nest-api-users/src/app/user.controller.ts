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
  async createUser(@Body() user: UserPropsDto): Promise<UserProps> {
    const result = await this.appService.createUser(user)
    return result.props
  }

  @Get()
  async findUser(@Query() criteria: TUserCriteria): Promise<UserProps[]> {
    const result = await this.appService.findUser([criteria])
    return result.map(user => user.props)
  }

  @Delete()
  deleteUser(@Query() criteria: TUserCriteria[]) {
    return this.appService.deleteUser(criteria)
  }

  @Patch(':id/credentials')
  async updateUserCredentials(@Param('id') id: string, @Body() credentials: UpdateUserCredentialsDto): Promise<UserProps> {
    const command = new ChangeUserCredentialsCommand(credentials, {
      id,
      schema: 'user',
      type: 'change-credentials',
      timestamp: Date.now(),
    })
    const result = await this.appService.updateUserCredentials(command)
    return result.props
  }
}
