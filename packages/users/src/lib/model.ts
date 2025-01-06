import { IPayload, MessageStore } from '@mostval/common'
import { TClientCredentials } from '@mostval/iam'
import { ChangeUserCredentialsCommand, UserCreated, UserCredentialsChanged } from './message'

export interface UserProps extends IPayload {
  readonly id: string
  readonly credentials: TClientCredentials
}

export class User<T extends UserProps> {
  constructor(readonly props: T, readonly msgStore: MessageStore) {
  }

  changeCredentials(command: ChangeUserCredentialsCommand): User<T> {
    const meta = {
      schema: 'user',
      type: 'credentials-changed',
      timestamp: Date.now(),
      id: this.props.id,
    }
    const payload = { credentials: command.payload['credentials'] } as Pick<UserProps, 'credentials'>
    const event = new UserCredentialsChanged(payload, meta)
    this.msgStore.add(event)
    const user = new User({ ...this.props, credentials: command.payload['credentials'] }, this.msgStore)
    return user
  }
}
