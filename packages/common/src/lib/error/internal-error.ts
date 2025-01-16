import { AbstractError } from './abstract-error';
import { ErrorCode } from './error-code-types';

export class InternalError extends AbstractError<string | Array<string> | Partial<any>> {
  constructor(errorOrMessage: string | Array<string> | Partial<any>) {
    super(errorOrMessage);
    this.code = ErrorCode.INTERNAL;
  }
}
