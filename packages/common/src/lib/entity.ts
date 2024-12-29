export interface Timestamp<TTimestamp = Date | string | number | undefined> {
  createdAt:  TTimestamp;
  updatedAt: TTimestamp;
}

export interface Entity<TIdentifier> {
  readonly id: TIdentifier;
  readonly timestamper: Timestamp;
  readonly version: number;
}

export abstract class BaseEntity<TIdentifier> implements Entity<TIdentifier> {
  constructor(
    public readonly id: TIdentifier,
    public readonly timestamper: Timestamp,
    public readonly version: number
  ) {}
}
