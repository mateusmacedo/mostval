import {
  CreateNewNotification,
  CreateNewNotificationSymbol,
  INotificationBuilder,
  INotificationBuilderSymbol,
  NotificationBuilder,
  PersistNotification,
  PersistNotificationSymbol,
} from '@mostval/notification';
import {
  INotificationPersisterRepository,
  INotificationPersisterRepositorySymbol,
} from 'packages/notification/src/lib/notification/domain/repository';
import { InMemoryNotificationPersisterRepository } from './notification.repository';

export const NotificationBuilderProvider = {
  provide: INotificationBuilderSymbol,
  useClass: NotificationBuilder<unknown>,
};

export const CreateNewNotificationProvider = {
  provide: CreateNewNotificationSymbol,
  useFactory: (builder: INotificationBuilder<unknown>) =>
    new CreateNewNotification(builder),
  inject: [INotificationBuilderSymbol],
};

export const NotificationPersisterRepositoryProvider = {
  provide: INotificationPersisterRepositorySymbol,
  useFactory: () => new InMemoryNotificationPersisterRepository(),
};

export const PersistNotificationProvider = {
  provide: PersistNotificationSymbol,
  useFactory: (repository: INotificationPersisterRepository) =>
    new PersistNotification(repository),
  inject: [INotificationPersisterRepositorySymbol],
};
