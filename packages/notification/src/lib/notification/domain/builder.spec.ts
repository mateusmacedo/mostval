import { NotificationBuilder } from './builder';
import { INotificationChannel, NotificationChannelType, NotificationStatus } from './notification';
import { IValueObject } from '@mostval/ddd';

class MockAddressValueObject implements IValueObject<string> {
    constructor(private value: string) {}
    getValue(): string {
        return this.value;
    }
    equals(other: IValueObject<string>): boolean {
        return this.value === other.getValue();
    }
    asString(): string {
        return this.value;
    }
    asJSON(): string {
        return JSON.stringify(this.value);
    }
}

describe('NotificationBuilder', () => {
    const mockEmailAddress = new MockAddressValueObject('test@example.com');
    const mockSMSAddress = new MockAddressValueObject('+5511999999999');

    const mockChannels: INotificationChannel<unknown>[] = [
        {
            type: NotificationChannelType.EMAIL,
            address: mockEmailAddress
        },
        {
            type: NotificationChannelType.SMS,
            address: mockSMSAddress
        }
    ];

    it('should build a notification with default values', () => {
        const builder = new NotificationBuilder<string>();
        const notification = builder
            .withContent('Test content')
            .build();

        expect(notification.getValue()).toEqual({
            channels: [],
            content: 'Test content',
            status: NotificationStatus.CREATED
        });
    });

    it('should build a notification with custom channels', () => {
        const builder = new NotificationBuilder<string>();
        const notification = builder
            .withChannels(mockChannels)
            .withContent('Test content')
            .build();

        expect(notification.getValue()).toEqual({
            channels: mockChannels,
            content: 'Test content',
            status: NotificationStatus.CREATED
        });
    });

    it('should build a notification with custom status', () => {
        const builder = new NotificationBuilder<string>();
        const notification = builder
            .withContent('Test content')
            .withStatus(NotificationStatus.SENT)
            .build();

        expect(notification.getValue()).toEqual({
            channels: [],
            content: 'Test content',
            status: NotificationStatus.SENT
        });
    });

    it('should build a notification with all custom values', () => {
        const builder = new NotificationBuilder<string>();
        const notification = builder
            .withChannels(mockChannels)
            .withContent('Test content')
            .withStatus(NotificationStatus.DELIVERED)
            .build();

        expect(notification.getValue()).toEqual({
            channels: mockChannels,
            content: 'Test content',
            status: NotificationStatus.DELIVERED
        });
    });

    it('should maintain builder fluent interface', () => {
        const builder = new NotificationBuilder<string>();

        expect(builder.withChannels([])).toBe(builder);
        expect(builder.withContent('test')).toBe(builder);
        expect(builder.withStatus(NotificationStatus.CREATED)).toBe(builder);
    });
});