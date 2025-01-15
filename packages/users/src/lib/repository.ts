import { User, UserProps } from './model'

export type TUserCriteria = {
  [key in keyof Partial<UserProps>]: UserProps[key]
}

export interface IUserRepository {
  save(user: User<UserProps>): Promise<User<UserProps>>
  find(criteria: TUserCriteria[]): Promise<User<UserProps>[]>
  remove(criteria: TUserCriteria[]): Promise<void>
}

export class InMemoryUserRepository implements IUserRepository {
  private users: User<UserProps>[] = []

  save(user: User<UserProps>): Promise<User<UserProps>> {
    const idx = this.users.findIndex((item) => item.props.id === user.props.id)
    if (idx > -1) {
      this.users[idx] = user
    } else {
      this.users.push(user)
    }
    return Promise.resolve(user)
  }

  find(criteria: TUserCriteria[]): Promise<User<UserProps>[]> {
    return Promise.resolve(this.users.filter((user) => criteria.every((criterion) => {
      const key = Object.keys(criterion)[0] as keyof UserProps;
      const value = criterion[key];
      return user.props[key] === value;
    })));
  }

  remove(criteria: TUserCriteria[]): Promise<void> {
    this.users = this.users.filter((item) => !criteria.every((criterion) => {
      const key = Object.keys(criterion)[0] as keyof UserProps;
      const value = criterion[key];
      return item.props[key] === value;
    }));
    return Promise.resolve();
  }
}

export const USER_REPOSITORY = Symbol('IUserRepository')