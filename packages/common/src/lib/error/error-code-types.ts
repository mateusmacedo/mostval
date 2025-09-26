import { ConflictError } from './conflict-error'
import { DependencyError } from './dependency-error'
import { InternalError } from './internal-error'
import { NotFoundError } from './not-found-error'
import { ProcessingError } from './processing-error'
import { ValidationError } from './validation-error'

export enum ErrorCode {
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION = 400,
  DEPENDENCY = 424,
  INTERNAL = 500,
  PROCESSING = 422,
}

export const ERRORS = {
  notFound: NotFoundError,
  conflict: ConflictError,
  dependency: DependencyError,
  internal: InternalError,
  validation: ValidationError,
  processing: ProcessingError,
} as const

export type ErrorsType = keyof typeof ERRORS
