import { AbstractError, ProcessingError } from '@mostval/common';
import { ErrorCode } from '@mostval/common';

export class NotificationError extends ProcessingError {
    static readonly code = ErrorCode.PROCESSING

    constructor(message: string, code?: number, previousError?: AbstractError<any>) {
        super(message, code, previousError);
    }
}
