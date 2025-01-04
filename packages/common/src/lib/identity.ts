export interface IIdentity<TIdentifier> {
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

export type TIdentity<TIdentifier, TVersion> = IIdentity<TIdentifier> & IVersion<TVersion>;

export type TIdetityWithTimestamps<TIdentifier, TVersion> = IIdentity<TIdentifier> & IVersion<TVersion> & ITimestamper;

export function createIdentity<TIdentifier, TVersion>(id: TIdentifier, version: TVersion): TIdentity<TIdentifier, TVersion> {
  return {
    id,
    version
  } as TIdentity<TIdentifier, TVersion>;
}

export function createTimestampedIdentity<TIdentifier, TVersion>(id: TIdentifier, version: TVersion): TIdetityWithTimestamps<TIdentifier, TVersion> {
  return {
    id,
    version,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TIdetityWithTimestamps<TIdentifier, TVersion>;
}
