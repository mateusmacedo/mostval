import {
  INotificationPersisterRepository,
  Notification,
} from '@mostval/notification';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InMemoryNotificationPersisterRepository
  implements INotificationPersisterRepository
{
  private notifications: Notification<unknown>[] = [];
  constructor(private readonly logger: Logger) {
    this.logger.log('InMemoryNotificationPersisterRepository initialized');
  }

  async persist<T>(notification: Notification<T>): Promise<Notification<T>> {
    let toPersist = notification;
    if (!notification.id) {
      toPersist = new Notification(notification.getValue(), {
        id: String(this.notifications.length + 1),
        version: notification.version + 1,
      });
    }

    this.notifications.push(toPersist);
    this.logger.log(`Notification persisted: ${toPersist.id}`);
    return toPersist;
  }

  async findAll(): Promise<Notification<unknown>[]> {
    this.logger.log(`Finding all notifications`);
    const result = this.notifications;
    this.logger.log(`Found ${result.length} notifications`);
    return result;
  }

  async findById(id: string): Promise<Notification<unknown> | undefined> {
    this.logger.log(`Finding notification by id: ${id}`);
    const result = this.notifications.find(
      (notification) => notification.id === id
    );
    this.logger.log(`Found notification: ${result?.id}`);
    return result;
  }

  async deleteById(id: string): Promise<void> {
    this.logger.log(`Deleting notification by id: ${id}`);
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id
    );
    this.logger.log(`Deleted notification by id: ${id}`);
  }
}
