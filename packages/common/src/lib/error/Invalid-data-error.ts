import { AbstractError } from './abstract-error';

export class InvalidDataError extends AbstractError<string | Array<string> | Partial<any>> {
  constructor(errorOrMessage: string | Array<string> | Partial<any>) {
    super(errorOrMessage);
  }
}
