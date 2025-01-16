import { IMetadata, Message } from '@mostval/common';

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
        if (message.metadata === null || message.metadata === undefined) {
            return false;
        }
        return Object.entries(criteria).every(([key, value]) => {
            if (key === 'payload' && message.payload && typeof value === 'object') {
                return Object.entries(value).every(
                    ([pKey, pValue]) => (message.payload as { [key: string]: any })[pKey] === pValue
                );
            }
            return key in message.metadata &&
                   (message.metadata as { [key: string]: any })[key] === value;
        });
    }
}

export const MESSAGE_STORE = Symbol('IMessageStore')