import { ErrorCode } from '@mostval/common';
import { AbstractError, ErrorMessage } from './abstract-error';

export class NotFoundError extends AbstractError<ErrorMessage> {
  constructor(message: ErrorMessage) {
    super(message);
    this.code = ErrorCode.NOT_FOUND;
  }
}