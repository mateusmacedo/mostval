import { AbstractError } from './abstract-error';

export class NotFoundError extends AbstractError<string | Array<string>> {
  constructor(errorOrMessage: string | Array<string>) {
    super(errorOrMessage);
  }
}
