import { BaseMetadata, TFlexible, Message } from '@mostval/common';
import { UserProps } from './model';
import { ICredentials } from '@mostval/iam';

export class CreateUserCommand extends Message<
  Partial<UserProps>,
  TFlexible<BaseMetadata>
> {
  constructor(payload: Partial<UserProps>, metadata: TFlexible<BaseMetadata>) {
    super(payload, metadata);
  }
}

export class UserCreatedEvent extends Message<
  Partial<UserProps>,
  TFlexible<BaseMetadata>
> {
  constructor(props: UserProps, metadata: TFlexible<BaseMetadata>) {
    super(
      {
        credentials: props.credentials,
        [props.credentials.id]: props.credentials,
      },
      metadata
    );
  }
}

export class ChangeUserCredentialsCommand extends Message<
  ICredentials,
  TFlexible<BaseMetadata>
> {
  constructor(payload: ICredentials, metadata: TFlexible<BaseMetadata>) {
    super(payload, metadata);
  }
}

export class UserCredentialsChangedEvent extends Message<
  ICredentials,
  TFlexible<BaseMetadata>
> {
  constructor(credentials: ICredentials, metadata: TFlexible<BaseMetadata>) {
    // super({ credentials, [credentials.id]: credentials }, metadata);
    super(credentials, metadata);
  }
}
