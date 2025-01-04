import { Stage } from '../pipeline';

export class TransformationError extends Error {
  constructor(message: string, public readonly originalError: Error) {
    super(message);
    this.name = 'TransformationError';
  }
}

export class TransformationStage<TInput = unknown, TOutput = unknown> implements Stage<TInput, TOutput> {
  name = 'TransformationStage';

  constructor(private transformer: (input: TInput) => TOutput | Promise<TOutput>) {}

  async execute(data: TInput): Promise<TOutput> {
    try {
      return await this.transformer(data);
    } catch (error) {
      throw new TransformationError(
        'Transformation failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async handleError(error: Error, context: TInput): Promise<TOutput> {
    if (error instanceof TransformationError) {
      console.warn('Transformation errors:', error.originalError);
      throw error;
    }
    return context as unknown as TOutput;
  }
}
