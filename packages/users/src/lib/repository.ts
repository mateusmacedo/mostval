import { User, UserProps } from './model'

export type TUserCriteria = [keyof UserProps, UserProps[keyof UserProps]]

export interface UserRepository {
  save(user: User<UserProps>): void
  find(criteria: TUserCriteria[]): User<UserProps>[]
  remove(criteria: TUserCriteria[]): void
}

export class InMemoryUserRepository implements UserRepository {
  private users: User<UserProps>[] = []

  save(user: User<UserProps>): void {
    this.users.push(user)
  }

  find(criteria: TUserCriteria[]): User<UserProps>[] {
    return this.users.filter((user) => criteria.every(([key, value]) => user.props[key] === value))
  }

  remove(criteria: TUserCriteria[]): void {
    this.users = this.users.filter((item) => !criteria.every(([key, value]) => item.props[key] === value))
  }
}