/*
eslint @typescript-eslint/no-explicit-any: 0
*/
import { Stage } from '../pipeline';

export interface Logger {
  info(message: string, data?: unknown): void;
  error(message: string, error?: Error): void;
}

export class LoggingStage<T extends object> implements Stage<T, T> {
  name = 'LoggingStage';

  constructor(
    private logger: Logger,
    private options: {
      logData?: boolean;
      maskFields?: Array<keyof T | string>;
    } = {}
  ) {}

  async execute(data: T): Promise<T> {
    const maskedData = this.options.logData
      ? this.maskSensitiveData(data)
      : undefined;

    this.logger.info('Processing data', maskedData);
    return data;
  }

  private maskSensitiveData(data: T): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const seen = new WeakSet();
    return this.cloneAndMask(data, seen);
  }

  private cloneAndMask(obj: T | T[], seen: WeakSet<object>): T | T[] {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (seen.has(obj)) {
      return '[Circular]' as unknown as T;
    }

    seen.add(obj);

    const result = Array.isArray(obj) ? [...obj] : { ...obj } as T;

    if (this.options.maskFields?.length) {
      for (const path of this.options.maskFields) {
        this.applyMask(result, String(path).split('.'));
      }
    }

    return result;
  }

  private applyMask(obj: T | T[], pathParts: string[]): void {
    const [current, ...rest] = pathParts;

    if (!obj || typeof obj !== 'object') return;

    if (rest.length === 0) {
      this.applyFinalMask(obj, current);
      return;
    }

    if (current === '*' && Array.isArray(obj)) {
      (obj as any[]).forEach(item => this.applyMask(item, rest));
    } else if (current in obj) {
      this.applyMask((obj as any)[current], rest);
    }
  }

  private applyFinalMask(obj: T | T[], current: string): void {
    if (current === '*' && Array.isArray(obj)) {
      (obj as unknown as any[]).fill('***');
    } else if (current in obj) {
      (obj as any)[current] = '***';
    }
  }

  private applyMaskToNestedObjects(obj: T, current: string, rest: string[]): void {
    if (current === '*' && Array.isArray(obj)) {
      obj.forEach(item => this.applyMask(item as T, rest));
    } else if (current in obj) {
      this.applyMask((obj as any)[current], rest);
    }
  }
}