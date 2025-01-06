import { User, UserProps, IUserRepository, IUserFactory, TUserCriteria, ChangeUserCredentialsCommand, UserNotFoundError } from '@mostval/users'
import { Injectable, Inject } from '@nestjs/common'
import { USER_FACTORY, USER_REPOSITORY } from '@mostval/users'
import { ICredentials } from '@mostval/iam'

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
    const criteria: TUserCriteria[] = [['id', command.metadata['id']]]
    const users = await this.userRepository.find(criteria)
    if (users.length === 0) {
      throw new UserNotFoundError('User not found')
    }
    const user = users[0]
    user.changeCredentials(command)
    return this.userRepository.save(user)
  }
}
