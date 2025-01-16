import { Notification, NotificationChannelType, TNotificationProps, INotificationChannel } from './notification';
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

    const mockProps: TNotificationProps = {
        templateId: { id: 'template-1', version: 1 },
        channels: mockChannels,
        content: 'Test notification content'
    };

    const mockIdentity = {
        id: 'notification-1',
        version: 1
    };

    const mockTimestamps = {
        createdAt: mockDate,
        updatedAt: mockDate
    };

    it('deve criar uma notificação com valores padrão quando identity e timestamps não são fornecidos', () => {
        const notification = new Notification(mockProps);

        expect(notification.id).toBe('');
        expect(notification.version).toBe(0);
        expect(notification.createdAt).toBeInstanceOf(Date);
        expect(notification.updatedAt).toBeInstanceOf(Date);
        expect(notification.getValue()).toEqual(mockProps);
    });

    it('deve criar uma notificação com identity e timestamps fornecidos', () => {
        const notification = new Notification(mockProps, mockIdentity, mockTimestamps);

        expect(notification.id).toBe('notification-1');
        expect(notification.version).toBe(1);
        expect(notification.createdAt).toBe(mockDate);
        expect(notification.updatedAt).toBe(mockDate);
        expect(notification.getValue()).toEqual(mockProps);
    });

    it('deve comparar duas notificações corretamente - caso igual', () => {
        const notification1 = new Notification(mockProps, mockIdentity, mockTimestamps);
        const notification2 = new Notification(mockProps, mockIdentity, mockTimestamps);

        expect(notification1.equals(notification2)).toBe(true);
    });

    it('deve comparar duas notificações corretamente - caso diferente', () => {
        const notification1 = new Notification(mockProps, mockIdentity, mockTimestamps);
        const differentProps = {
            ...mockProps,
            content: 'Different content'
        };
        const notification2 = new Notification(differentProps, mockIdentity, mockTimestamps);

        expect(notification1.equals(notification2)).toBe(false);
    });

    it('deve retornar false ao comparar com uma instância diferente', () => {
        const notification = new Notification(mockProps, mockIdentity, mockTimestamps);
        const differentInstance = {
            getValue: () => mockProps,
            equals: () => false,
            asString: () => '',
            asJSON: () => ''
        };

        expect(notification.equals(differentInstance)).toBe(false);
    });

    it('deve retornar false ao comparar notificações com canais diferentes', () => {
        const notification1 = new Notification(mockProps, mockIdentity, mockTimestamps);
        const differentChannels = {
            ...mockProps,
            channels: [mockChannels[0]] // apenas email
        };
        const notification2 = new Notification(differentChannels, mockIdentity, mockTimestamps);

        expect(notification1.equals(notification2)).toBe(false);
    });

    it('deve gerar uma representação em string correta', () => {
        const notification = new Notification(mockProps, mockIdentity, mockTimestamps);
        const expected = `Notification: [object Object] Test notification content EMAIL, SMS`;

        expect(notification.asString()).toBe(expected);
    });

    it('deve gerar uma representação JSON correta', () => {
        const notification = new Notification(mockProps, mockIdentity, mockTimestamps);
        const jsonString = notification.asJSON();
        const parsed = JSON.parse(jsonString);

        expect(parsed).toEqual({
            templateId: { id: 'template-1', version: 1 },
            channels: [
                { type: 'EMAIL', address: { value: 'test@example.com' } },
                { type: 'SMS', address: { value: '+5511999999999' } }
            ],
            content: 'Test notification content'
        });
    });
});