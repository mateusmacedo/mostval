import { Message } from '@mostval/common';
import { TNotificationMetadata, TNotificationMetadataWhenSendFailed } from './send-notification';
import { Notification, INotificationProps } from '..';
import { NotificationError } from '../error';

export class CreateNotification<T> extends Message<INotificationProps<T>, TNotificationMetadata> {
    constructor(payload: INotificationProps<T>, metadata: TNotificationMetadata) {
        super(payload, metadata);
    }
}

export class CreateNotificationError extends NotificationError {
}

export class NotificationCreated<T> extends Message<Notification<T>, TNotificationMetadata> {
    constructor(payload: Notification<T>, metadata: TNotificationMetadata) {
        super(payload, metadata);
    }
}

export class NotificationCreationFailed<T> extends Message<
  INotificationProps<T>,
  TNotificationMetadataWhenSendFailed
> {
  constructor(
    payload: INotificationProps<T>,
    metadata: TNotificationMetadataWhenSendFailed
  ) {
    super(payload, metadata);
  }
}