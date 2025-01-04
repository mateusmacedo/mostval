import { Stage } from '../pipeline';

export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
}

export class CachingStage<TInput, TOutput> implements Stage<TInput, TOutput> {
  name = 'CachingStage';
  private executionPromises = new Map<string, Promise<TOutput>>();

  constructor(
    private innerStage: Stage<TInput, TOutput>,
    private cache: Cache,
    private options: {
      ttl?: number;
      keyGenerator: (input: TInput) => string;
    }
  ) {}

  async execute(data: TInput): Promise<TOutput> {
    const cacheKey = this.options.keyGenerator(data);

    // Verifica se já existe uma execução em andamento
    const existingPromise = this.executionPromises.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = this.executeWithCache(data, cacheKey);
    this.executionPromises.set(cacheKey, promise);

    try {
      return await promise;
    } finally {
      this.executionPromises.delete(cacheKey);
    }
  }

  private async executeWithCache(data: TInput, cacheKey: string): Promise<TOutput> {
    const cached = await this.cache.get<TOutput>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.innerStage.execute(data);
    await this.cache.set(cacheKey, result, this.options.ttl);
    return result;
  }
}