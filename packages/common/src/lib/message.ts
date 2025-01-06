export interface IPayload {
    [key: string]: unknown;
}

export interface IMetadata {
    readonly schema: string;
    readonly type: string;
    readonly timestamp: number;
    readonly id: string;
}

export abstract class Message {
    readonly payload: IPayload;
    readonly metadata: IMetadata;

    constructor(payload: IPayload, metadata: IMetadata) {
        this.payload = payload
        this.metadata = metadata
    }
}

export interface MessageStore {
    add(message: Message): void;
    get(criteria: Partial<IPayload> | Partial<IMetadata>): Message[];
    remove(criteria: Partial<IPayload> | Partial<IMetadata>): void;
}

export class InMemoryMessageStore implements MessageStore {
    private messages: Message[] = [];

    add(message: Message): void {
        this.messages.push(message);
    }

    get(criteria: Partial<IPayload> | Partial<IMetadata>): Message[] {
        return this.messages.filter(message => this.matches(message, criteria));
    }

    remove(criteria: Partial<IPayload> | Partial<IMetadata>): void {
        this.messages = this.messages.filter(message => !this.matches(message, criteria));
    }

    private matches(message: Message, criteria: Partial<IPayload> | Partial<IMetadata>): boolean {
        return Object.keys(criteria).some(key =>
            (typeof message.payload === 'object' && message.payload !== null && key in message.payload && (message.payload as any)[key] === (criteria as any)[key]) ||
            (typeof message.metadata === 'object' && message.metadata !== null && key in message.metadata && (message.metadata as any)[key] === (criteria as any)[key])
        );
    }
}