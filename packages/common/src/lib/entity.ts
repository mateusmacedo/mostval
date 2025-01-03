export interface ITimestamp<TTimestamp = Date | string | number | undefined> {
  createdAt:  TTimestamp;
  updatedAt: TTimestamp;
}

export interface IVersion {
  readonly version: number;
}

export interface IEntity<TIdentifier> {
  readonly id: TIdentifier;
  readonly timestamper: ITimestamp;
  readonly version: IVersion;
}

export interface IEntityWithTimestamper<TIdentifier> extends IEntity<TIdentifier> {
  readonly timestamper: ITimestamp;
}

export interface IEntityWithVersion<TIdentifier> extends IEntity<TIdentifier> {
  readonly version: IVersion;
}

export interface IEntityWithTimestamperAndVersion<TIdentifier> extends IEntityWithTimestamper<TIdentifier>, IEntityWithVersion<TIdentifier> {}

export abstract class BaseEntity<TIdentifier> implements IEntityWithTimestamperAndVersion<TIdentifier> {
  constructor(
    public readonly id: TIdentifier,
    public readonly timestamper: ITimestamp,
    public readonly version: IVersion
  ) {}
}

export type TEntityWithTimestamper<TIdentifier> = IEntityWithTimestamper<TIdentifier>;
export type TEntityWithVersion<TIdentifier> = IEntityWithVersion<TIdentifier>;
export type TEntityWithTimestamperAndVersion<TIdentifier> = IEntityWithTimestamperAndVersion<TIdentifier>;
