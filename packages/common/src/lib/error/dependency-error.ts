import { ErrorCode } from '@mostval/common';
import { AbstractError } from './abstract-error';

export class DependencyError extends AbstractError<string | Array<string> | Partial<any>> {
  constructor(errorOrMessage: string | Array<string> | Partial<any>) {
    super(errorOrMessage);
    this.code = ErrorCode.DEPENDENCY;
  }
}
