import { IMessageStore, IMetadata, InMemoryMessageStore, IPayload, Message, MESSAGE_STORE } from '@mostval/common'
import { InMemoryUserRepository, USER_FACTORY, USER_REPOSITORY, UserFactory, UserProps } from '@mostval/users'
import { ICredentials } from '@mostval/iam'

export const UserFactoryProvider = {
  provide: USER_FACTORY,
  useFactory: (msgStore: IMessageStore<Message<IPayload<ICredentials>, IMetadata>>) => {
    return new UserFactory(msgStore)
  },
  inject: [MESSAGE_STORE],
}

export const MessageStoreProvider = {
  provide: MESSAGE_STORE,
  useFactory: () => {
    return new InMemoryMessageStore()
  },
}

export const UserRepositoryProvider = {
  provide: USER_REPOSITORY,
  useClass: InMemoryUserRepository,
}