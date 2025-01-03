export interface IVersion<TVersion> {
  readonly version: TVersion;
}

export interface IEntity<TIdentifier> {
  readonly id: TIdentifier;
}

export type TEntity<TIdentifier, TVersion> = IEntity<TIdentifier> & IVersion<TVersion>;
