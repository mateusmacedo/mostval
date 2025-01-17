import { ConflictError, NotFoundError } from '@mostval/common'

export class UserConflictError extends ConflictError {
  constructor(message: string) {
    super(message)
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(message: string) {
    super(message)
  }
}
