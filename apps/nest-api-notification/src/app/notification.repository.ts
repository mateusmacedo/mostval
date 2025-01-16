import {
  INotificationPersisterRepository,
  Notification,
} from '@mostval/notification';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryNotificationPersisterRepository
  implements INotificationPersisterRepository
{
  private notifications: Notification<unknown>[] = [];

  async persist<T>(notification: Notification<T>): Promise<Notification<T>> {
    let toPersist = notification;
    if (!notification.id) {
      toPersist = new Notification(notification.getValue(), {
        id: String(this.notifications.length + 1),
        version: notification.version + 1,
      });
    }

    this.notifications.push(toPersist);
    return toPersist;
  }

  async findAll(): Promise<Notification<unknown>[]> {
    return this.notifications;
  }

  async findById(id: string): Promise<Notification<unknown> | undefined> {
    return this.notifications.find((notification) => notification.id === id);
  }

  async deleteById(id: string): Promise<void> {
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id
    );
  }
}
