import {
  INotificationChannel,
  Notification,
  NotificationStatus,
} from './notification';
import { IBuilder } from '@mostval/common';

export interface INotificationBuilder<T> extends IBuilder<Notification<T>> {
  withChannels(channels: INotificationChannel[]): INotificationBuilder<T>;
  withContent(content: T): INotificationBuilder<T>;
  withStatus(status: NotificationStatus): INotificationBuilder<T>;
}

export const INotificationBuilderSymbol = Symbol('INotificationBuilder');

export class NotificationBuilder<T> implements INotificationBuilder<T> {
  private channels: INotificationChannel[] = [];
  private content!: T;
  private status: NotificationStatus = NotificationStatus.CREATED;

  build(): Notification<T> {
    if (this.content === undefined || this.content === null) {
      throw new Error('Content is required');
    }
    if (
      this.channels === undefined ||
      this.channels === null ||
      this.channels.length === 0
    ) {
      throw new Error('Channels are required');
    }
    const instance = new Notification<T>({
      channels: this.channels as INotificationChannel[],
      content: this.content,
      status: this.status,
    });
    this.channels = undefined as unknown as INotificationChannel[];
    this.content = undefined as unknown as T;
    this.status = undefined as unknown as NotificationStatus;
    return instance;
  }

  withChannels(channels: INotificationChannel[]): INotificationBuilder<T> {
    this.channels = channels;
    return this;
  }

  withContent(content: T): INotificationBuilder<T> {
    this.content = content;
    return this;
  }

  withStatus(status: NotificationStatus): INotificationBuilder<T> {
    this.status = status;
    return this;
  }
}

export const NotificationBuilderSymbol = Symbol(NotificationBuilder.name);