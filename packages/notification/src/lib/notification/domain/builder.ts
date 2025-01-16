import { INotificationChannel, Notification, NotificationStatus } from './notification';

export interface INotificationBuilder<T> {
    build(): Notification<T>;
    withChannels(channels: INotificationChannel<unknown>[]): INotificationBuilder<T>;
    withContent(content: T): INotificationBuilder<T>;
    withStatus(status: NotificationStatus): INotificationBuilder<T>;
}