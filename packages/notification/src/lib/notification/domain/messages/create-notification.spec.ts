import { ProcessingError } from '@mostval/common';
import { IValueObject } from '@mostval/ddd';
import { Notification, NotificationChannelType, NotificationStatus } from '..';
import { CreateNotification, CreateNotificationError, NotificationCreated, NotificationCreationFailed } from './create-notification';
import { TNotificationMetadata } from './send-notification';

class MockAddressValueObject implements IValueObject<string> {
    constructor(private value: string) {}
    getValue(): string { return this.value; }
    equals(other: IValueObject<string>): boolean { return this.value === other.getValue(); }
    asString(): string { return this.value; }
    asJSON(): string { return JSON.stringify(this.value); }
}

describe('Create Notification Messages', () => {
    const mockMetadata: TNotificationMetadata = {
      schema: 'notification/1.0',
      type: 'notification.create',
      id: 'notification-1',
      timestamp: new Date('2024-01-01T00:00:00.000Z').getTime(),
    };

    const mockPayload = {
        channels: [{
            type: NotificationChannelType.EMAIL,
            address: new MockAddressValueObject('test@example.com')
        }],
        content: 'Test content',
        status: NotificationStatus.CREATED
    };

    const mockNotification = new Notification(mockPayload);

    describe('CreateNotificationCommand', () => {
        it('should create command with payload and metadata', () => {
            const command = new CreateNotification(mockPayload, mockMetadata);

            expect(command.payload).toBe(mockPayload);
            expect(command.metadata).toBe(mockMetadata);
        });
    });

    describe('NotificationCreatedEvent', () => {
        it('should create event with notification and metadata', () => {
            const event = new NotificationCreated(mockNotification, mockMetadata);

            expect(event.payload).toBe(mockNotification);
            expect(event.metadata).toBe(mockMetadata);
        });
    });

    describe('NotificationCreationFailedEvent', () => {
        it('should create event with payload and error metadata', () => {
            const errorMetadata = {
                ...mockMetadata,
                error: new CreateNotificationError('Test Create Notification Error', 0, new ProcessingError('Test error'))
            };

            const event = new NotificationCreationFailed(mockPayload, errorMetadata);

            expect(event.payload).toBe(mockPayload);
            expect(event.metadata).toBe(errorMetadata);
        });
    });
});
