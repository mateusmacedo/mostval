import { IMetadata, Message } from '@mostval/common'
import { UserProps } from './model'
import { ICredentials } from '@mostval/iam'

export class CreateUserCommand extends Message<Partial<UserProps>> {
  constructor(payload: Partial<UserProps>, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class UserCreatedEvent extends Message<UserProps> {
  constructor(payload: UserProps, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class ChangeUserCredentialsCommand extends Message<ICredentials> {
  constructor(payload: ICredentials, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class UserCredentialsChangedEvent extends Message<ICredentials> {
  constructor(payload: ICredentials, metadata: IMetadata) {
    super(payload, metadata)
  }
}
