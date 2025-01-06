import { IMetadata, Message } from '@mostval/common'
import { UserProps } from './model'

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
