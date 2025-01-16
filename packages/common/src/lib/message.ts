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