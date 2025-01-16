import { ErrorCode } from '@mostval/common';
import { AbstractError } from './abstract-error';

export class ConflictError extends AbstractError<string | Array<string> | Partial<any>> {
  constructor(errorOrMessage: string | Array<string> | Partial<any>) {
    super(errorOrMessage);
    this.code = ErrorCode.CONFLICT
  }
}
