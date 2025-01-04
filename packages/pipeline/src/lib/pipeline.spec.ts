import { firstValueFrom } from 'rxjs';
import { Stage, PipelineError } from './pipeline';
import { Pipeline } from './pipeline';

describe('Pipeline', () => {
  // Base test stages
  class MultiplyStage implements Stage<number, number> {
    name = 'MultiplyStage';
    constructor(private multiplier: number) {}
    async execute(data: number): Promise<number> {
      return data * this.multiplier;
    }
  }

  class StringifyStage implements Stage<number, string> {
    name = 'StringifyStage';
    async execute(data: number): Promise<string> {
      return data.toString();
    }
  }

  // Error handling test stages
  class SimpleErrorStage implements Stage<unknown, never> {
    name = 'SimpleErrorStage';
    async execute(): Promise<never> {
      throw new Error('Simple error');
    }
  }

  class RecoverableErrorStage implements Stage<number, number> {
    name = 'RecoverableErrorStage';
    async execute(): Promise<number> {
      throw new Error('Recoverable error');
    }
    async handleError(_: Error, context: number): Promise<number> {
      return context * 2;
    }
  }

  class NonErrorThrowingStage implements Stage<unknown, never> {
    name = 'NonErrorThrowingStage';
    async execute(): Promise<never> {
      throw 'string error';
    }
  }

  class FailingRecoveryStage implements Stage<number, number> {
    name = 'FailingRecoveryStage';
    async execute(): Promise<number> {
      throw new Error('Initial error');
    }
    async handleError(): Promise<number> {
      throw new Error('Recovery failed');
    }
  }

  class AsyncStage implements Stage<number, number> {
    name = 'AsyncStage';
    constructor(private delay: number = 10) {}
    async execute(data: number): Promise<number> {
      return new Promise(resolve => setTimeout(() => resolve(data * 2), this.delay));
    }
  }

  let pipeline: Pipeline<number, number>;

  beforeEach(() => {
    pipeline = new Pipeline();
  });

  describe('Pipeline Configuration', () => {
    describe('addStage', () => {
      it('should add a stage and return pipeline instance for chaining', () => {
        const result = pipeline
          .addStage(new MultiplyStage(2))
          .addStage(new StringifyStage());

        expect(result).toBe(pipeline);
        expect(pipeline.getStages()).toHaveLength(2);
      });

      it('should maintain stage order', () => {
        const stages = [
          new MultiplyStage(2),
          new StringifyStage(),
          new MultiplyStage(3)
        ];

        stages.forEach(stage => pipeline.addStage(stage as Stage<number, number>));
        expect(pipeline.getStages()).toEqual(stages);
      });
    });

    describe('getStages and getStage', () => {
      const multiply = new MultiplyStage(2);
      const stringify = new StringifyStage();

      beforeEach(() => {
        pipeline.addStage(multiply).addStage(stringify);
      });

      it('should return all configured stages', () => {
        const stages = pipeline.getStages();
        expect(stages).toEqual([multiply, stringify]);
      });

      it('should return stage at specific index', () => {
        expect(pipeline.getStage(0)).toBe(multiply);
        expect(pipeline.getStage(1)).toBe(stringify);
      });

      it('should return undefined for invalid index', () => {
        expect(pipeline.getStage(-1)).toBeUndefined();
        expect(pipeline.getStage(2)).toBeUndefined();
      });
    });
  });

  describe('Pipeline Execution', () => {
    describe('Basic Execution', () => {
      it('should pass through data when pipeline is empty', async () => {
        const result = await firstValueFrom(pipeline.execute(5));
        expect(result).toBe(5);
      });

      it('should process data through single stage', async () => {
        pipeline.addStage(new MultiplyStage(2));
        const result = await firstValueFrom(pipeline.execute(5));
        expect(result).toBe(10);
      });

      it('should process data through multiple stages', async () => {
        pipeline
          .addStage(new MultiplyStage(2))
          .addStage(new MultiplyStage(3))
          .addStage(new StringifyStage());

        const result = await firstValueFrom(pipeline.execute(5));
        expect(result).toBe('30');
      });
    });

    describe('Async Execution', () => {
      it('should handle async stages', async () => {
        pipeline
          .addStage(new AsyncStage(10))
          .addStage(new AsyncStage(20));

        const result = await firstValueFrom(pipeline.execute(5));
        expect(result).toBe(20);
      });

      it('should complete observable after successful execution', async () => {
        const completionCallback = jest.fn();
        const errorCallback = jest.fn();

        pipeline
          .addStage(new AsyncStage(10))
          .execute(5)
          .subscribe({
            complete: completionCallback,
            error: errorCallback
          });

        await new Promise(resolve => setTimeout(resolve, 20));
        expect(completionCallback).toHaveBeenCalled();
        expect(errorCallback).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should wrap simple errors in PipelineError', async () => {
        pipeline.addStage(new SimpleErrorStage());

        await expect(firstValueFrom(pipeline.execute(5)))
          .rejects
          .toMatchObject({
            stageError: {
              stageName: 'SimpleErrorStage',
              message: 'Simple error'
            }
          });
      });

      it('should handle non-Error throws', async () => {
        pipeline.addStage(new NonErrorThrowingStage());

        await expect(firstValueFrom(pipeline.execute(5)))
          .rejects
          .toMatchObject({
            stageError: {
              message: 'Unknown error',
              name: 'UnknownError'
            }
          });
      });

      it('should recover from errors using handleError', async () => {
        pipeline
          .addStage(new MultiplyStage(2))
          .addStage(new RecoverableErrorStage())
          .addStage(new MultiplyStage(3));

        const result = await firstValueFrom(pipeline.execute(5));
        expect(result).toBe(60);
      });

      it('should handle errors in error recovery', async () => {
        pipeline.addStage(new FailingRecoveryStage());

        await expect(firstValueFrom(pipeline.execute(5)))
          .rejects
          .toMatchObject({
            stageError: {
              stageName: 'FailingRecoveryStage',
              message: expect.stringContaining('Error recovery failed')
            }
          });
      });

      it('should preserve error context', async () => {
        const inputValue = 5;
        pipeline
          .addStage(new MultiplyStage(2))
          .addStage(new SimpleErrorStage());

        await expect(firstValueFrom(pipeline.execute(inputValue)))
          .rejects
          .toMatchObject({
            stageError: {
              context: 10
            }
          });
      });

      it('should emit error through observable', (done) => {
        pipeline.addStage(new SimpleErrorStage());

        pipeline.execute(5).subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(PipelineError);
            done();
          }
        });
      });
    });
  });
});
