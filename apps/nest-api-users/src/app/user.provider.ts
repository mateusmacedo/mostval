import {
  BaseMetadata,
  IMessageStore,
  InMemoryMessageStore,
  Message,
  MESSAGE_STORE,
  TFlexible,
} from '@mostval/common';
import { ICredentials } from '@mostval/iam';
import {
  InMemoryUserRepository,
  USER_FACTORY,
  USER_REPOSITORY,
  UserFactory,
} from '@mostval/users';

export const UserFactoryProvider = {
  provide: USER_FACTORY,
  useFactory: (
    msgStore: IMessageStore<
      Message<TFlexible<ICredentials>, TFlexible<BaseMetadata>>
    >
  ) => {
    return new UserFactory(msgStore);
  },
  inject: [MESSAGE_STORE],
};

export const MessageStoreProvider = {
  provide: MESSAGE_STORE,
  useFactory: () => {
    return new InMemoryMessageStore();
  },
};

export const UserRepositoryProvider = {
  provide: USER_REPOSITORY,
  useClass: InMemoryUserRepository,
};
