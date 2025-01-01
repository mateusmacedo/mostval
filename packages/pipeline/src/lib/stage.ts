export interface Stage<TInput = unknown, TOutput = unknown> {
    execute(data: TInput): Promise<TOutput>;
}