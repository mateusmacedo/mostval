import { IMetadata, Message } from '@mostval/common';
import { Notification } from '../../domain';
import { NotificationError } from '../../domain/error';

export type TNotificationMetadata = IMetadata & {
    readonly notificationId: string;
}

export type TNotificationMetadataWhenSending<T> = Omit<TNotificationMetadata, 'notificationId'>

export type TNotificationMetadataWhenSendFailed<T> = TNotificationMetadataWhenSending<T> & {
    readonly error: NotificationError;
}

export class SendNotification<T> extends Message {
    constructor(payload: Notification<T>, metadata: TNotificationMetadataWhenSending<T>) {
        super(payload, metadata);
    }
}

export class NotificationSent<T> extends Message {
    constructor(payload: Notification<T>, metadata: TNotificationMetadata) {
        super(payload, metadata);
    }
}

export class NotificationFailed<T> extends Message {
    constructor(payload: Notification<T>, metadata: TNotificationMetadataWhenSendFailed<T>) {
        super(payload, metadata);
    }
}