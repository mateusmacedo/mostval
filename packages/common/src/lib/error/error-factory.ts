import { AbstractError, ErrorMessage } from './abstract-error'
import { ERRORS, ErrorsType } from './error-types'

export class ErrorFactory {
  private static instance: ErrorFactory
  private map = new Map<ErrorsType, new (message: ErrorMessage) => AbstractError>()

  private constructor() {
    this.register()
  }

  static getInstance(): ErrorFactory {
    if (!ErrorFactory.instance) {
      ErrorFactory.instance = new ErrorFactory()
    }
    return ErrorFactory.instance
  }

  public create(type: ErrorsType, message: ErrorMessage): AbstractError {
    const ErrorClass = this.map.get(type)
    if (!ErrorClass) {
      throw new Error(`Error type '${type}' not registered`)
    }
    return new ErrorClass(message)
  }

  public register(): void {
    Object.entries(ERRORS).map((err) => {
      this.map.set(err[0] as ErrorsType, err[1])
    })
  }

  public exists(action: ErrorsType): boolean {
    return this.map.has(action)
  }

  public getActions() {
    return this.map.entries()
  }
}
