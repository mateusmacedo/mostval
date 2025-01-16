import { ITimestamper, TIdentity } from '@mostval/common';
import { AggregateRoot, IValueObject } from '@mostval/ddd';

export enum NotificationStatus {
    CREATED = 'CREATED',
    SCHEDULED = 'SCHEDULED',
    ENQUEUED = 'ENQUEUED',
    SENT = 'SENT',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    DELIVERED = 'DELIVERED'
}

export enum NotificationChannelType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH'
}

export interface INotificationChannel<T> {
    type: NotificationChannelType
    address: IValueObject<T>
}

export interface INotificationProps<T> {
    channels: INotificationChannel<unknown>[]
    content: T
    status: NotificationStatus
}

export class Notification<T> extends AggregateRoot<string, number> implements IValueObject<INotificationProps<T>> {
    constructor(
        protected props: INotificationProps<T>,
        identity?: TIdentity<string, number>,
        timestamps?: ITimestamper
    ) {
        super(
            identity?.id ?? '',
            identity?.version ?? 0,
            timestamps?.createdAt ?? new Date(),
            timestamps?.updatedAt ?? new Date()
        );
    }
    getValue(): INotificationProps<T> {
        return this.props;
    }

    equals(other: IValueObject<INotificationProps<T>>): boolean {
        if (!(other instanceof Notification)) {
            return false;
        }
        return (
            this.props.content === other.getValue().content &&
            this.props.status === other.getValue().status &&
            this.props.channels.length === other.getValue().channels.length &&
            this.props.channels.every((channel, index) =>
                channel.type === other.getValue().channels[index].type &&
                channel.address.equals(other.getValue().channels[index].address)
            )
        );
    }

    asString(): string {
        return `Notification: ${this.props.content} ${this.props.channels.map(channel => channel.type).join(', ')}`;
    }

    asJSON(): string {
        return JSON.stringify(this.props);
    }
}
