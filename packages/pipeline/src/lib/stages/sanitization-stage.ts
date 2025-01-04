import { Stage } from '../pipeline';

export class SanitizationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'SanitizationError';
  }
}

export interface SanitizationRule<T extends object> {
  field: keyof T;
  sanitize: (value: unknown) => T[keyof T];
}

export class SanitizationStage<T extends object> implements Stage<T, T> {
  name = 'SanitizationStage';

  constructor(private rules: SanitizationRule<T>[]) {}

  async execute(data: T): Promise<T> {
    const sanitized = { ...data };

    for (const rule of this.rules) {
      try {
        sanitized[rule.field] = rule.sanitize(sanitized[rule.field]);
      } catch (error) {
        throw new SanitizationError(
          `Failed to sanitize field ${String(rule.field)}`,
          String(rule.field)
        );
      }
    }

    return sanitized;
  }
}