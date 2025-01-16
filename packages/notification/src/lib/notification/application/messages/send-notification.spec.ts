import { SendNotification, NotificationSent, NotificationFailed, TNotificationMetadataWhenSending } from './send-notification';
import { Notification, NotificationChannelType, NotificationStatus, TNotificationProps } from '../../domain';
import { NotificationError } from '../../domain/error';
import { IValueObject } from '@mostval/ddd';

class MockAddressValueObject implements IValueObject<string> {
    constructor(private value: string) {}
    getValue(): string { return this.value; }
    equals(other: IValueObject<string>): boolean { return this.value === other.getValue(); }
    asString(): string { return this.value; }
    asJSON(): string { return JSON.stringify(this.value); }
}

describe('Send Notification Messages', () => {
    const baseMetadataWhenSending: TNotificationMetadataWhenSending<string> = {
        id: 'notification-1',
        timestamp: new Date('2024-01-01T00:00:00.000Z').getTime(),
        schema: 'notification/1.0',
        type: 'notification.send'
    }

    const mockPayload: TNotificationProps<string> = {
        channels: [{
            type: NotificationChannelType.EMAIL,
            address: new MockAddressValueObject('test@example.com')
        }],
        content: 'Test content',
        status: NotificationStatus.CREATED
    };

    const mockNotification = new Notification(mockPayload);

    describe('SendNotification', () => {
        it('should create command with notification and sending metadata', () => {
            const command = new SendNotification(mockNotification, baseMetadataWhenSending);

            expect(command.payload).toBe(mockNotification);
            expect(command.metadata).toBe(baseMetadataWhenSending);
        });
    });

    describe('NotificationSent', () => {
        it('should create event with notification and complete metadata', () => {
            const metadata = {
                ...baseMetadataWhenSending,
                notificationId: 'notification-1'
            };

            const event = new NotificationSent(mockNotification, metadata);

            expect(event.payload).toBe(mockNotification);
            expect(event.metadata).toBe(metadata);
        });
    });

    describe('NotificationFailed', () => {
        it('should create event with notification and error metadata', () => {
            const errorMetadata = {
                ...baseMetadataWhenSending,
                error: new NotificationError('Test error', 404)
            };

            const event = new NotificationFailed(mockNotification, errorMetadata);

            expect(event.payload).toBe(mockNotification);
            expect(event.metadata).toBe(errorMetadata);
        });
    });
});
