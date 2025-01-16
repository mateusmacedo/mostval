import {
  CreateNewNotification,
  CreateNewNotificationSymbol,
  PersistNotification,
  PersistNotificationSymbol,
  TCreateNewNotificationInput,
  TPersistNotificationData,
} from '@mostval/notification';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(CreateNewNotificationSymbol)
    private createNewNotification: CreateNewNotification,
    @Inject(PersistNotificationSymbol)
    private persistNotification: PersistNotification
  ) {}

  async createAndPersistNotification<T>(
    data: TCreateNewNotificationInput<T>
  ): Promise<TPersistNotificationData<T>> {
    const notification = await this.createNewNotification.execute(data);
    return await this.persistNotification.execute(notification);
  }
}
