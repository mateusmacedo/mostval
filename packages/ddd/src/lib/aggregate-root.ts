import { IIdentity, IVersion, ITimestamper } from '@mostval/common';

export interface IAggregate<TIdentifier, TVersion> extends IIdentity<TIdentifier>, IVersion<TVersion>, ITimestamper {
}

export abstract class AggregateRoot<TIdentifier, TVersion> implements IAggregate<TIdentifier, TVersion> {
    constructor(readonly id: TIdentifier, readonly version: TVersion, readonly createdAt: Date, readonly updatedAt: Date) {}
}
