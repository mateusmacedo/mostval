import { Observable } from 'rxjs';

export interface StageError extends Error {
  stageName: string;
  originalError: Error;
  context?: unknown;
}

export interface Stage<TInput = unknown, TOutput = unknown> {
  name: string;
  execute(data: TInput): Promise<TOutput>;
  handleError?(error: Error, context: TInput): Promise<TOutput>;
}

export class PipelineError extends Error {
  constructor(public readonly stageError: StageError) {
    super(`Pipeline failed at stage "${stageError.stageName}": ${stageError.message}`);
  }
}

export class Pipeline<TIn, TOut> {
  private stages: Stage<any, any>[] = [];

  addStage<TNewOut>(stage: Stage<TOut, TNewOut>): Pipeline<TIn, TNewOut> {
    this.stages.push(stage);
    return (this as unknown) as Pipeline<TIn, TNewOut>;
  }

  getStages(): Stage<unknown, unknown>[] {
    return this.stages;
  }

  getStage(index: number): Stage<unknown, unknown> {
    return this.stages[index];
  }

  execute(input: TIn): Observable<TOut> {
    return new Observable<TOut>(subscriber => {
      let result: unknown = input;

      const executeStages = async (index: number) => {
        if (index >= this.stages.length) {
          subscriber.next(result as TOut);
          subscriber.complete();
          return;
        }

        const stage = this.stages[index];
        try {
          result = await stage.execute(result);
          executeStages(index + 1);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorName = error instanceof Error ? error.name : 'UnknownError';
          const stageError: StageError = {
            name: errorName,
            stageName: stage.name,
            message: errorMessage,
            originalError: error as Error,
            context: result
          };

          try {
            if (stage.handleError) {
              result = await stage.handleError(error as Error, result);
              executeStages(index + 1);
            } else {
              subscriber.error(new PipelineError(stageError));
            }
          } catch (recoveryError) {
            subscriber.error(new PipelineError({
              ...stageError,
              message: `Error recovery failed: ${recoveryError instanceof Error ? recoveryError.message : 'Unknown error'}`,
              originalError: recoveryError as Error
            }));
          }
        }
      };

      executeStages(0);
    });
  }
}
