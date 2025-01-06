import { IMessageStore, IPayload } from '@mostval/common'
import { ICredentials } from '@mostval/iam'
import { ChangeUserCredentialsCommand, UserCredentialsChangedEvent } from './message'

export interface UserProps extends IPayload {
  readonly id: string
  readonly credentials: ICredentials
}

export class User<T extends UserProps> {
  constructor(readonly props: T, private readonly msgStore: IMessageStore) {
  }

  changeCredentials(command: ChangeUserCredentialsCommand): User<T> {
    const meta = {
      schema: 'user',
      type: 'credentials-changed',
      timestamp: Date.now(),
      id: this.props.id,
    }
    const credentials = command.payload as ICredentials
    const event = new UserCredentialsChangedEvent( credentials , meta)
    this.msgStore.add(event)
    const user = new User({ ...this.props, credentials }, this.msgStore)
    return user
  }
}
