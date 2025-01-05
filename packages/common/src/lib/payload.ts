export interface IPayload {
    [key: string]: unknown;
}

export interface IMetadata {
    timestamp: Date;
    issuerId?: string;
    [key: string]: unknown;
}

export abstract class Payload implements IPayload, IMetadata {
    timestamp: Date;
    issuerId?: string | undefined;
    [key: string]: unknown;

    constructor(timestamp: Date, issuerId?: string) {
        this.timestamp = timestamp;
        this.issuerId = issuerId;
    }
}