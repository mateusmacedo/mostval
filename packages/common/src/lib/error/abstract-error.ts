export type ErrorMessage = string | string[] | Record<string, unknown>

export abstract class AbstractError<TError = ErrorMessage> {
  constructor(
    private errorOrMessage: TError,
    private code: number = 0,
    private previousError: AbstractError | null = null,
  ) {}

  getError(): TError {
    return this.errorOrMessage
  }

  getCode(): number | undefined {
    return this.code
  }

  getPreviousError(): AbstractError | null {
    return this.previousError
  }
}
