import { IValueObject } from '@mostval/ddd';
import {
  INotificationChannel,
  NotificationChannelType,
  TCreateNewNotificationInput,
} from '@mostval/notification';

export class NotificationChannelDto implements INotificationChannel {
  type: NotificationChannelType;
  address: IValueObject<string>;
}

export class NotificationDto<T> implements TCreateNewNotificationInput<T> {
  channels: NotificationChannelDto[];
  content: T;
}
