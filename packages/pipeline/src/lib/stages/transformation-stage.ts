import { Stage } from '../pipeline';

export class TransformationStage<TInput = unknown, TOutput = unknown> implements Stage<TInput, TOutput> {
  name: string = 'TransformationStage';
  constructor(private transformer: (input: TInput) => TOutput) {}

  async execute(data: TInput): Promise<TOutput> {
    return this.transformer(data);
  }
}
