export interface IEntity<TIdentifier> {
  readonly id: TIdentifier;
}

export interface IVersion<TVersion> {
  readonly version: TVersion;
}

export interface ICreatedAt {
  readonly createdAt: Date;
}

export interface IUpdatedAt {
  readonly updatedAt: Date;
}

export type ITimestamper = ICreatedAt & IUpdatedAt;

export type TEntity<TIdentifier, TVersion> = IEntity<TIdentifier> & IVersion<TVersion>;

export type TEntityWithTimestamps<TIdentifier, TVersion> = IEntity<TIdentifier> & IVersion<TVersion> & ITimestamper;

export function createEntity<TIdentifier, TVersion>(id: TIdentifier, version: TVersion): TEntity<TIdentifier, TVersion> {
  return {
    id,
    version
  } as TEntity<TIdentifier, TVersion>;
}

export function createTimestampedEntity<TIdentifier, TVersion>(id: TIdentifier, version: TVersion): TEntityWithTimestamps<TIdentifier, TVersion> {
  return {
    id,
    version,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TEntityWithTimestamps<TIdentifier, TVersion>;
}
