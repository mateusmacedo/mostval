import { IMessageStore, InMemoryMessageStore, MESSAGE_STORE } from '@mostval/common'
import { InMemoryUserRepository, USER_FACTORY, USER_REPOSITORY, UserFactory } from '@mostval/users'
export const UserProvider = {
  provide: USER_FACTORY,
  useFactory: (msgStore: IMessageStore) => {
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