import { Stage } from '../pipeline';

export class ValidationError extends Error {
  constructor(message: string, public readonly validationErrors: string[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationRule<T> {
  validate(data: T): Promise<string[]>;
}

export class ValidationStage<TIn, TOut> implements Stage<TIn, TOut> {
  name = 'Validation Stage';

  constructor(private readonly rules: ValidationRule<TIn>[]) {}

  async execute(data: TIn): Promise<TOut> {
    const errors: string[] = [];

    for (const rule of this.rules) {
      const ruleErrors = await rule.validate(data);
      errors.push(...ruleErrors);
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return data as unknown as TOut;
  }

  async handleError(error: Error, context: TIn): Promise<TOut> {
    if (error instanceof ValidationError) {
      console.warn('Validation errors:', error.validationErrors);
      throw error;
    }
    return context as unknown as TOut;
  }
}
