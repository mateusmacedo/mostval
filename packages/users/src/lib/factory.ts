import { IMessageStore } from '@mostval/common'
import { User, UserProps } from './model'
import { UserCreatedEvent } from './message'

export interface IUserFactory {
  create(props: UserProps): User<UserProps>
}

export class UserFactory implements IUserFactory {
  constructor(private readonly msgStore: IMessageStore) {}

  create(props: UserProps): User<UserProps> {
    const user = new User(props, this.msgStore)
    const userCreatedEvent = new UserCreatedEvent({ ...props }, {
      schema: 'user',
      type: 'created',
      timestamp: Date.now(),
      id: props.id,
    });
    this.msgStore.add(userCreatedEvent)

    return user
  }
}

export const USER_FACTORY = Symbol('IUserFactory')