import { INotificationChannel, Notification, NotificationStatus } from './notification';
import { IBuilder } from '@mostval/common';

export interface INotificationBuilder<T> extends IBuilder<Notification<T>> {
    withChannels(channels: INotificationChannel<unknown>[]): INotificationBuilder<T>;
    withContent(content: T): INotificationBuilder<T>;
    withStatus(status: NotificationStatus): INotificationBuilder<T>;
}

export class NotificationBuilder<T> implements INotificationBuilder<T> {
    private channels: INotificationChannel<unknown>[] = [];
    private content!: T;
    private status: NotificationStatus = NotificationStatus.CREATED;

    build(): Notification<T> {
        return new Notification<T>({
            channels: this.channels,
            content: this.content,
            status: this.status
        });
    }

    withChannels(channels: INotificationChannel<unknown>[]): INotificationBuilder<T> {
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