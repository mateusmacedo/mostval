import { MessageStore } from '@mostval/common'
import { User, UserProps } from './model'
import { UserCreated } from './message'

export class UserFactory {
  constructor(private readonly msgStore: MessageStore) {}

  create(props: UserProps): User<UserProps> {
    const user = new User(props, this.msgStore)
    const userCreatedEvent = new UserCreated({ ...props }, {
      schema: 'user',
      type: 'created',
      timestamp: Date.now(),
      id: props.id,
    });
    this.msgStore.add(userCreatedEvent)

    return user
  }
}