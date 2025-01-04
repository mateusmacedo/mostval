import { Stage } from '../pipeline';

export class EnrichmentError extends Error {
  constructor(message: string, public readonly source: string) {
    super(message);
    this.name = 'EnrichmentError';
  }
}

export interface EnrichmentSource<TInput, TOutput> {
  name: string;
  enrich: (data: TInput) => Promise<TOutput>;
}

export class EnrichmentStage<TInput, TOutput> implements Stage<TInput, TOutput> {
  name = 'EnrichmentStage';

  constructor(private source: EnrichmentSource<TInput, TOutput>) {}

  async execute(data: TInput): Promise<TOutput> {
    try {
      return await this.source.enrich(data);
    } catch (error) {
      throw new EnrichmentError(
        `Enrichment failed from source ${this.source.name}`,
        this.source.name
      );
    }
  }
}