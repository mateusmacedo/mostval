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

  private cloneAndMask(obj: any, seen: WeakSet<object>): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (seen.has(obj)) {
      return '[Circular]';
    }

    seen.add(obj);

    const masked = Array.isArray(obj)
      ? [...obj]
      : { ...obj };

    for (const key in masked) {
      if (Object.prototype.hasOwnProperty.call(masked, key)) {
        masked[key] = this.cloneAndMask(masked[key], seen);
      }
    }

    if (this.options.maskFields?.length) {
      for (const path of this.options.maskFields) {
        this.applyMask(masked, String(path).split('.'));
      }
    }

    return masked;
  }

  private applyMask(obj: any, pathParts: string[]): void {
    const [current, ...rest] = pathParts;

    if (!obj || typeof obj !== 'object') {
      return;
    }

    if (rest.length === 0) {
      if (current === '*' && Array.isArray(obj)) {
        obj.forEach((_, index) => {
          obj[index] = '***';
        });
      } else if (current in obj) {
        obj[current] = '***';
      }
      return;
    }

    if (current === '*' && Array.isArray(obj)) {
      obj.forEach(item => {
        if (item && typeof item === 'object') {
          this.applyMask(item, rest);
        }
      });
    } else if (current in obj) {
      const value = obj[current];
      if (value && typeof value === 'object') {
        this.applyMask(value, rest);
      }
    }
  }
}