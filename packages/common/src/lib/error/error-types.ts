import { ConflictError } from './conflict-error'
import { DependencyError } from './dependency-error'
import { InternalError } from './internal-error'
import { InvalidDataError } from './Invalid-data-error'
import { NotFoundError } from './not-found-error'
import { ValidationError } from './validation-error'

export enum ErrorCode {
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION = 400,
  DEPENDENCY = 424,
  INTERNAL = 500,
  INVALID_DATA = 422,
  PROCESSING = 422,
}

export const ERRORS = {
  notFound: NotFoundError,
  conflict: ConflictError,
  dependency: DependencyError,
  internal: InternalError,
  invalidData: InvalidDataError,
  validation: ValidationError,
} as const
export type ErrorsType = keyof typeof ERRORS
