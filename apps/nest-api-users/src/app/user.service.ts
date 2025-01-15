import { User, UserProps, IUserRepository, IUserFactory, TUserCriteria, ChangeUserCredentialsCommand, UserNotFoundError } from '@mostval/users'
import { Injectable, Inject } from '@nestjs/common'
import { USER_FACTORY, USER_REPOSITORY } from '@mostval/users'

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_FACTORY) private readonly userFactory: IUserFactory,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async createUser(userProps: UserProps): Promise<User<UserProps>> {
    const user = this.userFactory.create(userProps)
    return this.userRepository.save(user)
  }

  async findUser(criteria: TUserCriteria[]): Promise<User<UserProps>[]> {
    return this.userRepository.find(criteria)
  }

  async deleteUser(criteria: TUserCriteria[]): Promise<void> {
    return this.userRepository.remove(criteria)
  }

  async updateUserCredentials(command: ChangeUserCredentialsCommand): Promise<User<UserProps>> {
    const users = await this.userRepository.find([{ id: command.metadata['id'] }])
    if (users.length === 0) {
      throw new UserNotFoundError('User not found')
    }
    return this.userRepository.save(users[0].changeCredentials(command))
  }
}
