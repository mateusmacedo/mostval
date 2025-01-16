import { IMetadata, Message, IPayload } from './message';
import { InMemoryMessageStore } from './message-store';

interface TestPayload extends IPayload<string> {
    value: string;
    [field: string]: string;
}

class TestMessage extends Message<TestPayload, IMetadata> {
    constructor(value: string, metadata: IMetadata) {
        super({ value }, metadata);
    }
}

describe('InMemoryMessageStore', () => {
    let store: InMemoryMessageStore<Message<TestPayload, IMetadata>>;
    const baseMetadata: IMetadata = {
        id: 'msg-1',
        schema: 'test/1.0',
        type: 'test.created',
        timestamp: new Date('2024-01-01T00:00:00.000Z').getTime()
    };

    beforeEach(() => {
        store = new InMemoryMessageStore();
    });

    describe('add', () => {
        it('should add a message to the store', () => {
            const message = new TestMessage('test', baseMetadata);
            store.add(message);

            const messages = store.get({ id: 'msg-1' });
            expect(messages).toHaveLength(1);
            expect(messages[0]).toBe(message);
        });
    });

    describe('get', () => {
        beforeEach(() => {
            store.add(new TestMessage('test1', { ...baseMetadata, id: 'msg-1' }));
            store.add(new TestMessage('test2', { ...baseMetadata, id: 'msg-2' }));
        });

        it('should get messages by metadata criteria', () => {
            const messages = store.get({ schema: 'test/1.0' });
            expect(messages).toHaveLength(2);
        });

        it('should get messages by payload criteria', () => {
            const messages = store.get({ payload: { value: 'test1' } });
            expect(messages).toHaveLength(1);
            expect(messages[0].payload.value).toBe('test1');
        });

        it('should return empty array when no matches found', () => {
            const messages = store.get({ id: 'non-existent' });
            expect(messages).toHaveLength(0);
        });

        it('should handle null/undefined payload properties', () => {
            const messageWithNullPayload = new TestMessage('null', {
                ...baseMetadata,
                id: 'msg-null'
            });
            Object.defineProperty(messageWithNullPayload, 'payload', { value: null });
            store.add(messageWithNullPayload);

            const messages = store.get({ id: 'msg-null' });
            expect(messages).toHaveLength(1);
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            store.add(new TestMessage('test1', { ...baseMetadata, id: 'msg-1' }));
            store.add(new TestMessage('test2', { ...baseMetadata, id: 'msg-2' }));
        });

        it('should remove messages by metadata criteria', () => {
            store.remove({ id: 'msg-1' });
            const messages = store.get({});
            expect(messages).toHaveLength(1);
            expect(messages[0].metadata.id).toBe('msg-2');
        });

        it('should remove messages by payload criteria', () => {
            store.remove({ payload: { value: 'test1' } });
            const messages = store.get({});
            expect(messages).toHaveLength(1);
            expect(messages[0].payload.value).toBe('test2');
        });

        it('should handle no matches found', () => {
            store.remove({ id: 'non-existent' });
            const messages = store.get({});
            expect(messages).toHaveLength(2);
        });

        it('should handle null/undefined metadata properties', () => {
            const messageWithNullMetadata = new TestMessage('null', {
                ...baseMetadata,
                id: 'msg-null'
            });
            Object.defineProperty(messageWithNullMetadata, 'metadata', { value: null });
            store.add(messageWithNullMetadata);

            store.remove({ id: 'msg-null' });
            const messages = store.get({});
            expect(messages).toHaveLength(2);
        });
    });
});
