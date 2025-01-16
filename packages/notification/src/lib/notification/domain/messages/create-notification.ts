import { Message } from '@mostval/common';
import { TNotificationMetadata, TNotificationMetadataWhenSendFailed } from './send-notification';
import { Notification, TNotificationProps } from '..';
import { NotificationError } from '../error';

export class CreateNotification<T> extends Message<TNotificationProps<T>> {
    constructor(payload: TNotificationProps<T>, metadata: TNotificationMetadata) {
        super(payload, metadata);
    }
}

export class CreateNotificationError extends NotificationError {
}

export class NotificationCreated<T> extends Message<Notification<T>> {
    constructor(payload: Notification<T>, metadata: TNotificationMetadata) {
        super(payload, metadata);
    }
}

export class NotificationCreationFailed<T> extends Message<TNotificationProps<T>> {
    constructor(payload: TNotificationProps<T>, metadata: TNotificationMetadataWhenSendFailed<T>) {
        super(payload, metadata);
    }
}