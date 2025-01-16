import { IMetadata, Message } from './message';

class MessageProps {
    constructor(readonly id: string, readonly email: string) {}
}

class MessageSpec extends Message<MessageProps> {
    constructor(payload: MessageProps, metadata: IMetadata) {
        super(payload, metadata);
    }
}

describe('Message', () => {
    it('should be able to create a message', () => {
        const message = new MessageSpec(new MessageProps('123', 'test@test.com'), {
            id: '123',
            schema: 'payload',
            type: 'payload',
            timestamp: Date.now(),
        });
        expect(message).toBeDefined();
    });

    it('should be able to get the payload', () => {
        const message = new MessageSpec(new MessageProps('123', 'test@test.com'), {
            id: '123',
            schema: 'payload',
            type: 'payload',
            timestamp: Date.now(),
        });
        expect(message.payload).toBeDefined();
    });

    it('should be able to get the metadata', () => {
        const message = new MessageSpec(new MessageProps('123', 'test@test.com'), {
            id: '123',
            schema: 'payload',
            type: 'payload',
            timestamp: Date.now(),
        });
        expect(message.metadata).toBeDefined();
    });
});
