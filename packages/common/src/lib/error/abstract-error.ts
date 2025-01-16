export type ErrorMessage = string | Array<string> | Record<string, unknown> | Array<Record<string, unknown>>

export abstract class AbstractError<T extends ErrorMessage> extends Error {
  originalMessage: T;
  code?: number;
  previousError?: AbstractError<any>;

  constructor(message: T, code?: number, previousError?: AbstractError<any>) {
    super(typeof message === 'string' ? message : JSON.stringify(message));
    this.originalMessage = message;
    this.code = code;
    this.previousError = previousError;
  }
}
