export type ValidationResult = {
  success: boolean
  errors: string[]
}

export interface ValidationRule<T = any> {
  validate(input: T, path?: string): ValidationResult
}

export class ObjectValidationRule<T extends object> implements ValidationRule<T> {
  constructor(private rules: { [K in keyof T]?: ValidationRule<T[K]> }) {}

  validate(input: unknown, path = ''): ValidationResult {
    if (typeof input !== 'object' || Array.isArray(input) || input === null) {
      return { success: false, errors: [`${path}: Expected an object`] }
    }
    const result: ValidationResult = { success: true, errors: [] }
    for (const key in this.rules) {
      const rule = this.rules[key]
      if (rule === undefined) continue
      const validation = rule.validate((input as T)[key], `${path}.${key}`)
      if (!validation.success) {
        result.success = false
        result.errors = result.errors.concat(validation.errors)
      }
    }
    return result
  }
}

export class ArrayValidationRule<T> implements ValidationRule<T[]> {
  constructor(private rule: ValidationRule<T>) {}

  validate(input: any, path = ''): ValidationResult {
    if (!Array.isArray(input)) {
      return { success: false, errors: [`${path}: Expected an array`] }
    }
    const result: ValidationResult = { success: true, errors: [] }
    input.forEach((item, index) => {
      const validation = this.rule.validate(item, `${path}[${index}]`)
      if (!validation.success) {
        result.success = false
        result.errors = result.errors.concat(validation.errors)
      }
    })
    return result
  }
}
