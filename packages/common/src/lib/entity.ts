export interface IVersion<TVersion> {
  readonly version: TVersion;
}

export interface IEntity<TIdentifier> {
  readonly id: TIdentifier;
}

export interface ITimestamper {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type TEntity<TIdentifier, TVersion> = IEntity<TIdentifier> & IVersion<TVersion> & ITimestamper;

export type TEntityWithTimestamps<TIdentifier, TVersion> = IEntity<TIdentifier> & IVersion<TVersion>;