import { IMetadata, Message } from '@mostval/common'
import { UserProps } from './model'
import { ICredentials } from '@mostval/iam'

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
  constructor(payload: ICredentials, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class UserCredentialsChanged extends Message {
  constructor(payload: ICredentials, metadata: IMetadata) {
    super(payload, metadata)
  }
}
