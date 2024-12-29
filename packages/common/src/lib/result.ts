export class Result<T, E> {
  private constructor(
    private readonly isSuccess: boolean,
    private readonly value?: T,
    private readonly error?: E
  ) {}

  public static Ok<const T>(value: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  public static Err<const E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error);
  }

  public isOk(): this is Result<T, never> {
    return this.isSuccess;
  }

  public isErr(): this is Result<never, E> {
    return !this.isSuccess;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get the value of an error result.');
    }
    return this.value as T;
  }

  public getError(): E {
    if (this.isSuccess) {
      throw new Error('Cannot get the error of a successful result.');
    }
    return this.error as E;
  }
}