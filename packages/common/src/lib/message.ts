/*
eslint-disable
*/
export interface IPayload {}

export interface IMetadata {
    readonly schema: string;
    readonly type: string;
    readonly timestamp: number;
    readonly id: string;
}

export abstract class Message<T> {
    readonly payload: T;
    readonly metadata: IMetadata;

    constructor(payload: T, metadata: IMetadata) {
        this.payload = payload
        this.metadata = metadata
    }
}

export interface IMessageStore {
    add<T extends Message<unknown>>(message: T): void;
    get<T extends Message<unknown>>(criteria: Partial<T> | Partial<IMetadata>): T[];
    remove<T extends Message<unknown>>(criteria: Partial<T> | Partial<IMetadata>): void;
}

export class InMemoryMessageStore implements IMessageStore {
    private messages: Message<unknown>[] = [];

    add<T extends Message<unknown>>(message: T): void {
        this.messages.push(message);
    }

    get<T extends Message<unknown>>(criteria: Partial<T> | Partial<IMetadata>): T[] {
        return this.messages.filter(message => this.matches(message, criteria)) as T[];
    }

    remove<T extends Message<unknown>>(criteria: Partial<T> | Partial<IMetadata>): void {
        this.messages = this.messages.filter(message => !this.matches(message, criteria));
    }

    private matches<T extends Message<unknown>>(message: T, criteria: Partial<T> | Partial<IMetadata>): boolean {
        return Object.keys(criteria).some(key =>
            (typeof message.payload === 'object' && message.payload !== null && key in message.payload && (message.payload as any)[key] === (criteria as any)[key]) ||
            (typeof message.metadata === 'object' && message.metadata !== null && key in message.metadata && (message.metadata as any)[key] === (criteria as any)[key])
        );
    }
}

export const MESSAGE_STORE = Symbol('IMessageStore')