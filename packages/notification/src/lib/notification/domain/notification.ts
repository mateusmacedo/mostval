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

export type TNotificationProps = {
    templateId: TIdentity<string, number>
    channels: INotificationChannel<unknown>[]
    content: string
    status: NotificationStatus
}

export class Notification extends AggregateRoot<string, number> implements IValueObject<TNotificationProps> {
    constructor(
        protected props: TNotificationProps,
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
    getValue(): TNotificationProps {
        return this.props;
    }

    equals(other: IValueObject<TNotificationProps>): boolean {
        if (!(other instanceof Notification)) {
            return false;
        }
        return (
            this.props.templateId.id === other.getValue().templateId.id &&
            this.props.templateId.version === other.getValue().templateId.version &&
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
        return `Notification: ${this.props.templateId} ${this.props.content} ${this.props.channels.map(channel => channel.type).join(', ')}`;
    }

    asJSON(): string {
        return JSON.stringify(this.props);
    }
}
