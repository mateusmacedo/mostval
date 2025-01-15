import { AbstractError } from './abstract-error';

export class ProcessingError extends AbstractError<string | Array<string> | Partial<any>> {
  constructor(
    errorOrMessage: string | Array<string> | Partial<any>,
    code?: number,
    previousError?: AbstractError<any>
  ) {
    super(errorOrMessage, code, previousError);
  }
}
