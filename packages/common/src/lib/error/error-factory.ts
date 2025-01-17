import { AbstractError, ErrorMessage } from './abstract-error'
import { ERRORS, ErrorsType } from './error-code-types'

export class ErrorFactory {
  private static instance: ErrorFactory
  private map = new Map<ErrorsType, new (message: ErrorMessage) => AbstractError<ErrorMessage>>()

  private constructor() {
    this.register()
  }

  static getInstance(): ErrorFactory {
    if (!ErrorFactory.instance) {
      ErrorFactory.instance = new ErrorFactory()
    }
    return ErrorFactory.instance
  }

  public create(type: ErrorsType, message: ErrorMessage): AbstractError<ErrorMessage> {
    const ErrorClass = this.map.get(type)
    if (!ErrorClass) {
      throw new Error(`Error type '${type}' not registered`)
    }
    return new ErrorClass(message)
  }

  private register(): void {
    Object.entries(ERRORS).forEach(([key, ErrorClass]) => {
      this.map.set(key as ErrorsType, ErrorClass as new (message: ErrorMessage) => AbstractError<ErrorMessage>)
    })
  }

  public exists(action: ErrorsType): boolean {
    return this.map.has(action)
  }

  public getActions() {
    return this.map.entries()
  }
}
