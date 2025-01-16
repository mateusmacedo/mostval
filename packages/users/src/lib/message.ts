import { IMetadata, Message } from '@mostval/common'
import { UserProps } from './model'
import { ICredentials } from '@mostval/iam'
import { IPayload } from '@mostval/common'

export class CreateUserCommand extends Message<Partial<UserProps>, IMetadata> {
  constructor(payload: Partial<UserProps>, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class UserCreatedEvent extends Message<IPayload<ICredentials>, IMetadata> {
  constructor(props: UserProps, metadata: IMetadata) {
    super({ credentials: props.credentials, [props.credentials.id]: props.credentials }, metadata)
  }
}

export class ChangeUserCredentialsCommand extends Message<ICredentials, IMetadata> {
  constructor(payload: ICredentials, metadata: IMetadata) {
    super(payload, metadata)
  }
}

export class UserCredentialsChangedEvent extends Message<IPayload<ICredentials>, IMetadata> {
  constructor(credentials: ICredentials, metadata: IMetadata) {
    super({ credentials, [credentials.id]: credentials }, metadata);
  }
}
