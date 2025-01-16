import { IMetadata, Message } from '@mostval/common';
import { Notification } from '..';
import { NotificationError } from '../error';

export type TNotificationMetadata = IMetadata

export type TNotificationMetadataWhenSending = Omit<
  TNotificationMetadata,
  'notificationId'
>;

export type TNotificationMetadataWhenSendFailed =
  TNotificationMetadataWhenSending & {
    readonly error: NotificationError;
  };

export class SendNotification<T> extends Message<
  Notification<T>,
  TNotificationMetadataWhenSending
> {
  constructor(
    payload: Notification<T>,
    metadata: TNotificationMetadataWhenSending
  ) {
    super(payload, metadata);
  }
}

export class NotificationSent<T> extends Message<
  Notification<T>,
  TNotificationMetadata
> {
  constructor(payload: Notification<T>, metadata: TNotificationMetadata) {
    super(payload, metadata);
  }
}

export class NotificationSendFailed<T> extends Message<
  Notification<T>,
  TNotificationMetadataWhenSendFailed
> {
  constructor(
    payload: Notification<T>,
    metadata: TNotificationMetadataWhenSendFailed
  ) {
    super(payload, metadata);
  }
}