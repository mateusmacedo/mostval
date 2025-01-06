import { User, UserProps } from './model'

export type TUserCriteria = [keyof UserProps, UserProps[keyof UserProps]]

export interface IUserRepository {
  save(user: User<UserProps>): Promise<User<UserProps>>
  find(criteria: TUserCriteria[]): Promise<User<UserProps>[]>
  remove(criteria: TUserCriteria[]): Promise<void>
}

export class InMemoryUserRepository implements IUserRepository {
  private users: User<UserProps>[] = []

  save(user: User<UserProps>): Promise<User<UserProps>> {
    this.users.push(user)
    return Promise.resolve(user)
  }

  find(criteria: TUserCriteria[]): Promise<User<UserProps>[]> {
    return Promise.resolve(this.users.filter((user) => criteria.every(([key, value]) => user.props[key] === value)))
  }

  remove(criteria: TUserCriteria[]): Promise<void> {
    this.users = this.users.filter((item) => !criteria.every(([key, value]) => item.props[key] === value))
    return Promise.resolve()
  }
}

export const USER_REPOSITORY = Symbol('IUserRepository')