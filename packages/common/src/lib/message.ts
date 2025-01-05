export interface IPayload {
    [key: string]: unknown;
}

export interface IMetadata {
    readonly schema: string;
    readonly type: string;
    readonly id: string;
    readonly correlationId: string;
    readonly timestamp: number;
    readonly issuer?: string;
    readonly [key: string]: unknown;
}

export abstract class Message<T> {
    readonly payload: T;
    readonly metadata: IMetadata;

    constructor(payload: T, metadata: IMetadata) {
        this.payload = payload
        this.metadata = metadata
    }
}