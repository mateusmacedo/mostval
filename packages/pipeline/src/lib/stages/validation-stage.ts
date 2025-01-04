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

export class ValidationStage<T> implements Stage<T, T> {
  name = 'Validation Stage';

  constructor(private readonly rules: ValidationRule<T>[]) {}

  async execute(data: T): Promise<T> {
    const errors: string[] = [];

    for (const rule of this.rules) {
      const ruleErrors = await rule.validate(data);
      errors.push(...ruleErrors);
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return data;
  }

  async handleError(error: Error, context: T): Promise<T> {
    if (error instanceof ValidationError) {
      // Aqui você pode implementar lógica de correção automática
      // ou logging específico para erros de validação
      console.warn('Validation errors:', error.validationErrors);
    }

    throw error; // Re-throw se não puder recuperar
  }
}
