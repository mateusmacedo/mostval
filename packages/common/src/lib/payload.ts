export interface IPayload {
    [key: string]: any;
}

export interface IMetadata {
    timestamp: Date;
    issuerId?: string;
    [key: string]: any;
}

export abstract class Payload implements IPayload, IMetadata {
    timestamp: Date;
    issuerId?: string | undefined;
    [key: string]: any;

    constructor(timestamp: Date, issuerId?: string) {
        this.timestamp = timestamp;
        this.issuerId = issuerId;
    }
}