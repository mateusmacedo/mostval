import { IMetadata, IPayload, Message } from '@mostval/common';

export interface IMessageStore<T extends Message<IPayload<unknown>, IMetadata>> {
  add(message: T): void
  get(criteria: Partial<T> | Partial<IMetadata>): T[]
  remove(criteria: Partial<T> | Partial<IMetadata>): void
}

export class InMemoryMessageStore<T extends Message<IPayload<unknown>, IMetadata>>
  implements IMessageStore<T>
{
  private messages: T[] = []

  add(message: T): void {
    this.messages.push(message)
  }

  get(criteria: Partial<T> | Partial<IMetadata>): T[] {
    return this.messages.filter((message) => this.matches(message, criteria)) as T[]
  }

  remove(criteria: Partial<T> | Partial<IMetadata>): void {
    this.messages = this.messages.filter((message) => !this.matches(message, criteria))
  }

  private matches(message: T, criteria: Partial<T> | Partial<IMetadata>): boolean {
    if (!message.metadata) {
      return false
    }
    return Object.entries(criteria).every(([key, value]) => {
      if (key === 'payload' && message.payload && typeof value === 'object') {
        return Object.entries(value).every(
          ([pKey, pValue]) => (message.payload as { [key: string]: any })[pKey] === pValue,
        )
      }
      return key in message.metadata && (message.metadata as { [key: string]: any })[key] === value
    })
  }
}

export const MESSAGE_STORE = Symbol('IMessageStore')