import { firstValueFrom } from 'rxjs';
import { Stage } from './stage';
import { Pipeline } from './pipeline';

describe('Pipeline', () => {
  // Helper test stages
  class MultiplyStage implements Stage<number, number> {
    constructor(private multiplier: number) {}
    async execute(data: number): Promise<number> {
      return data * this.multiplier;
    }
  }

  class StringifyStage implements Stage<number, string> {
    async execute(data: number): Promise<string> {
      return data.toString();
    }
  }

  class ErrorStage implements Stage<unknown, never> {
    async execute(): Promise<never> {
      throw new Error('Test error');
    }
  }

  let pipeline: Pipeline;

  beforeEach(() => {
    pipeline = new Pipeline();
  });

  describe('addStage', () => {
    it('should add a stage and return new pipeline instance', () => {
      const stage = new MultiplyStage(2);
      const result = pipeline.addStage(stage);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Pipeline);
    });

    it('should allow chaining multiple stages', () => {
      const result = pipeline
        .addStage(new MultiplyStage(2))
        .addStage(new MultiplyStage(3));

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Pipeline);
    });

    it('should handle type transformations correctly', () => {
      const numberToString = pipeline
        .addStage(new MultiplyStage(2))
        .addStage(new StringifyStage());

      expect(numberToString).toBeDefined();
      expect(numberToString).toBeInstanceOf(Pipeline);
    });
  });

  describe('execute', () => {
    it('should process data through single stage', async () => {
      pipeline.addStage(new MultiplyStage(2));

      const result = await firstValueFrom(pipeline.execute(5));
      expect(result).toBe(10);
    });

    it('should process data through multiple stages', async () => {
      pipeline
        .addStage(new MultiplyStage(2))
        .addStage(new MultiplyStage(3));

      const result = await firstValueFrom(pipeline.execute(5));
      expect(result).toBe(30); // 5 * 2 * 3
    });

    it('should handle type transformations in stages', async () => {
      const numberToStringPipeline = pipeline
        .addStage(new MultiplyStage(2))
        .addStage(new StringifyStage());

      const result = await firstValueFrom(numberToStringPipeline.execute(5));
      expect(result).toBe('10');
    });

    it('should emit error when stage fails', async () => {
      pipeline
        .addStage(new MultiplyStage(2))
        .addStage(new ErrorStage());

      await expect(firstValueFrom(pipeline.execute(5)))
        .rejects
        .toThrow('Test error');
    });

    it('should complete observable after successful execution', async () => {
      pipeline.addStage(new MultiplyStage(2));

      const completionCallback = jest.fn();

      pipeline.execute(5).subscribe({
        complete: completionCallback
      });

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(completionCallback).toHaveBeenCalled();
    });

    it('should handle empty pipeline', async () => {
      const result = await firstValueFrom(pipeline.execute(5));
      expect(result).toBe(5);
    });

    it('should process async transformations', async () => {
      class AsyncStage implements Stage<number, number> {
        async execute(data: number): Promise<number> {
          return new Promise(resolve =>
            setTimeout(() => resolve(data * 2), 10)
          );
        }
      }

      pipeline
        .addStage(new AsyncStage())
        .addStage(new AsyncStage());

      const result = await firstValueFrom(pipeline.execute(5));
      expect(result).toBe(20); // 5 * 2 * 2
    });
  });
});
