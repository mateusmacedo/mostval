export interface Timestamper {
  createdAt:  string | Date | undefined;
  updatedAt: Date | string | undefined;
}

export interface Entity<TIdentifier> {
  readonly id: TIdentifier;
  readonly timestamper: Timestamper;
  readonly version: number;
}

export abstract class BaseEntity<TIdentifier> implements Entity<TIdentifier> {
  constructor(
    public readonly id: TIdentifier,
    public readonly timestamper: Timestamper,
    public readonly version: number
  ) {}
}
