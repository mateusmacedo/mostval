import { Stage } from '../stage';

export class TransformationStage<TInput = unknown, TOutput = unknown> implements Stage<TInput, TOutput> {
  constructor(private transformer: (input: TInput) => TOutput) {}

  async execute(data: TInput): Promise<TOutput> {
    return this.transformer(data);
  }
}
