import { Notification } from './notification';

export interface INotificationPersisterRepository {
  persist<T>(notification: Notification<T>): Promise<Notification<T>>;
}

export const INotificationPersisterRepositorySymbol = Symbol(
  'INotificationPersisterRepository'
);
