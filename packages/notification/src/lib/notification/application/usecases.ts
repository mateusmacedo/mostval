import { INotificationBuilder } from '../domain/builder';
import {
  INotificationProps,
  Notification,
  NotificationStatus,
} from '../domain/notification';
import { INotificationPersisterRepository } from '../domain/repository';

type TCreateNewNotificationOutput<T> = Notification<T>;

export type TCreateNewNotificationInput<T> = Partial<INotificationProps<T>>;

export class CreateNewNotification {
  constructor(private readonly builder: INotificationBuilder<unknown>) {}

  async execute<T>(
    props: TCreateNewNotificationInput<T>
  ): Promise<TCreateNewNotificationOutput<T>> {
    const model = this.builder
      .withContent(props.content)
      .withChannels(props.channels ?? [])
      .build() as Notification<T>;

    return model;
  }
}

export const CreateNewNotificationSymbol = Symbol(CreateNewNotification.name);

export type TPersistNotificationData<T> = Notification<T>;

export class PersistNotification {
  constructor(private readonly repository: INotificationPersisterRepository) {}

  async execute<T>(
    data: TPersistNotificationData<T>
  ): Promise<TPersistNotificationData<T>> {
    return await this.repository.persist(data);
  }
}

export const PersistNotificationSymbol = Symbol(PersistNotification.name);
