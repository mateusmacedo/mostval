import { Message } from '@mostval/common';
import { TNotificationMetadata, TNotificationMetadataWhenSendFailed } from './send-notification';
import { Notification, TNotificationProps } from '../../domain';
import { NotificationError } from '../../domain/error';

export class CreateNotification<T> extends Message {
    constructor(payload: TNotificationProps<T>, metadata: TNotificationMetadata) {
        super(payload, metadata);
    }
}

export class CreateNotificationError extends NotificationError {
}

export class NotificationCreated<T> extends Message {
    constructor(payload: Notification<T>, metadata: TNotificationMetadata) {
        super(payload, metadata);
    }
}

export class NotificationCreationFailed<T> extends Message {
    constructor(payload: TNotificationProps<T>, metadata: TNotificationMetadataWhenSendFailed<T>) {
        super(payload, metadata);
    }
}