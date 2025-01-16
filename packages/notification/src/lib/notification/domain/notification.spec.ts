import { IIdentity, ITimestamper, TIdentity } from '@mostval/common';
import { Notification, NotificationChannelType, INotificationProps, INotificationChannel, NotificationStatus } from './notification';
import { IValueObject } from '@mostval/ddd';

class MockAddressValueObject implements IValueObject<string> {
    constructor(private value: string) {}
    getValue(): string {
        return this.value;
    }
    equals(other: IValueObject<string>): boolean {
        return this.getValue() === other.getValue();
    }
    asString(): string {
        return this.getValue();
    }
    asJSON(): string {
        return JSON.stringify(this.getValue());
    }
}

describe('Notification', () => {
    const mockDate = new Date('2024-01-01T00:00:00.000Z');
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

    const mockProps: (
        channels: INotificationChannel<unknown>[],
        content: string,
        status: NotificationStatus
    ) => INotificationProps<string> = (channels, content, status) => ({
        channels,
        content,
        status
    });

    const mockIdentity: (id: string, version: number) => TIdentity<string, number> = (id, version) => ({
        id,
        version
    });

    const mockTimestamps: (createdAt: Date, updatedAt: Date) => ITimestamper = (createdAt, updatedAt) => ({
        createdAt,
        updatedAt
    });

    it('should create a notification with default values when identity and timestamps are not provided', () => {
        const notification = new Notification(mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        ));

        expect(notification.id).toBe('');
        expect(notification.version).toBe(0);
        expect(notification.createdAt).toBeInstanceOf(Date);
        expect(notification.updatedAt).toBeInstanceOf(Date);
        expect(notification.getValue()).toEqual(mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        ));
    });

    it('should create a notification with provided identity and timestamps', () => {
        const notification = new Notification(mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        ), { id: 'notification-1', version: 1 }, mockTimestamps(mockDate, mockDate));

        expect(notification.id).toBe('notification-1');
        expect(notification.version).toBe(1);
        expect(notification.createdAt).toBe(mockDate);
        expect(notification.updatedAt).toBe(mockDate);
        expect(notification.getValue()).toEqual(mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        ));
    });

    it('should compare two notifications correctly - equal case', () => {
        const props = mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        );

        const notification1 = new Notification(props,
            mockIdentity('notification-1', 1),
            mockTimestamps(mockDate, mockDate)
        );
        const notification2 = new Notification(props,
            mockIdentity('notification-2', 2), // diferentes IDs não afetam a igualdade
            mockTimestamps(mockDate, mockDate)
        );

        expect(notification1.equals(notification2)).toBe(true);
    });

    it('should compare two notifications correctly - different case', () => {
        const notification1 = new Notification(mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        ), mockIdentity('notification-1', 1), mockTimestamps(mockDate, mockDate));
        const notification2 = new Notification(mockProps(
            mockChannels,
            'Different content',
            NotificationStatus.CREATED
        ), mockIdentity('notification-1', 1), mockTimestamps(mockDate, mockDate));

        expect(notification1.equals(notification2)).toBe(false);
    });

    it('should return false when comparing with a different instance', () => {
        const notification = new Notification(mockProps(
            [...mockChannels],
            'Test notification content',
            NotificationStatus.CREATED
        ));
        const differentInstance = {
            getValue: () => mockProps(
                mockChannels,
                'Test notification content',
                NotificationStatus.CREATED
            ),
            equals: () => false,
            asString: () => '',
            asJSON: () => ''
        } as IValueObject<INotificationProps<string>>;

        expect(notification.equals(differentInstance)).toBe(false);
    });

    it('should return false when comparing notifications with different channels', () => {
        const notification1 = new Notification(mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        ), mockIdentity('notification-1', 1), mockTimestamps(mockDate, mockDate));
        const notification2 = new Notification(mockProps(
            [mockChannels[0]], // apenas email
            'Test notification content',
            NotificationStatus.CREATED
        ), mockIdentity('notification-1', 1), mockTimestamps(mockDate, mockDate));

        expect(notification1.equals(notification2)).toBe(false);
    });

    it('should generate a correct string representation', () => {
        const notification = new Notification(mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        ), mockIdentity('notification-1', 1), mockTimestamps(mockDate, mockDate));
        const expected = `Notification: Test notification content EMAIL, SMS`;

        expect(notification.asString()).toBe(expected);
    });

    it('should generate a correct JSON representation', () => {
        const notification = new Notification(mockProps(
            mockChannels,
            'Test notification content',
            NotificationStatus.CREATED
        ), mockIdentity('notification-1', 1), mockTimestamps(mockDate, mockDate));
        const jsonString = notification.asJSON();
        const parsed = JSON.parse(jsonString);

        expect(parsed).toEqual({
            channels: [
                { type: 'EMAIL', address: { value: 'test@example.com' } },
                { type: 'SMS', address: { value: '+5511999999999' } }
            ],
            content: 'Test notification content',
            status: 'CREATED'
        });
    });
});