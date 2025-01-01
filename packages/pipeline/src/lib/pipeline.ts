import { Observable } from 'rxjs';
import { Stage } from './stage';

export class Pipeline {
  private stages: Stage<unknown, unknown>[] = [];

  addStage<TInput = unknown, TStageOutput = unknown>(stage: Stage<TInput, TStageOutput>): Pipeline {
    this.stages.push(stage);
    return this;
  }

  execute<TInput = unknown, TOutput = unknown>(initialData: TInput): Observable<TOutput> {
    return new Observable<TOutput>(subscriber => {
      let result: unknown = initialData;

      const executeStages = async (index: number) => {
        if (index >= this.stages.length) {
          subscriber.next(result as TOutput);
          subscriber.complete();
          return;
        }

        const stage = this.stages[index];
        try {
          result = await stage.execute(result);
          executeStages(index + 1);
        } catch (error) {
          subscriber.error(error);
        }
      };

      executeStages(0);
    });
  }
}
