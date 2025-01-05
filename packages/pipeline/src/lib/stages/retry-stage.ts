import { Stage } from '../pipeline';

export interface RetryPolicy {
  maxAttempts: number;
  delay: number;
  shouldRetry: (error: Error) => boolean;
}

export class RetryError extends Error {
  constructor(message: string, public readonly source: string) {
    super(message);
    this.name = 'RetryError';
  }
}

export type RetryAwaitable<T> = (data: T) => Promise<void>;

export class RetryStage<TInput, TOutput> implements Stage<TInput, TOutput> {
  name = 'RetryStage';

  constructor(
    private innerStage: Stage<TInput, TOutput>,
    private policy: RetryPolicy,
    private awaitable: RetryAwaitable<number>
  ) {}

  async execute(data: TInput): Promise<TOutput> {
    if (this.policy.maxAttempts === 0) {
      throw new RetryError('Immediate failure', this.innerStage.name);
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= this.policy.maxAttempts; attempt++) {
      try {
        return await this.innerStage.execute(data);
      } catch (error) {
        if (error instanceof Error) {
          lastError = error;
        } else {
          throw new RetryError('Non-error thrown', this.innerStage.name);
        }

        if (!this.policy.shouldRetry(lastError)) {
          throw lastError;
        }

        const delay = this.policy.delay * Math.pow(2, attempt - 1);
        await this.awaitable(delay);
      }
    }

    throw lastError;
  }
}
