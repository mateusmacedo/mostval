import { IMetadata, IPayload, MessageStore } from '@mostval/common'

import { Message } from '@mostval/common'
import { TClientCredentials } from '@mostval/iam'

export interface UserProps extends IPayload {
  readonly id: string
  readonly credentials: TClientCredentials
}

export class CreateUserCommand extends Message {
  constructor(payload: Partial<UserProps>, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class UserCreated extends Message {
  constructor(payload: UserProps, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class ChangeUserCredentialsCommand extends Message {
  constructor(payload: Pick<UserProps, 'credentials'>, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class UserCredentialsChanged extends Message {
  constructor(payload: Pick<UserProps, 'credentials'>, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class User<T extends UserProps> {
  constructor(readonly props: T, readonly msgStore: MessageStore) {
    this.msgStore.add(new UserCreated({ ...this.props }, {
      schema: 'user',
      type: 'created',
      timestamp: Date.now(),
      id: this.props.id,
    }))
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

export class UserFactory {
  constructor(private readonly msgStore: MessageStore) {}

  create(props: UserProps): User<UserProps> {
    return new User(props, this.msgStore)
  }
}

export type TUserCriteria<T extends UserProps> = [keyof T, string][]

export interface UserRepository {
  save(user: User<UserProps>): void
  find(criteria: TUserCriteria<UserProps>): User<UserProps>[]
}

export class InMemoryUserRepository implements UserRepository {
  private users: User<UserProps>[] = []

  save(user: User<UserProps>): void {
    this.users.push(user)
  }

  find(criteria: TUserCriteria<UserProps>): User<UserProps>[] {
    return this.users.filter((user) => criteria.every(([key, value]) => user.props[key] === value))
  }
}
