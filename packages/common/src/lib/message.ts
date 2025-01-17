import { TFlexible } from './utility-type';

export type BaseMetadata = {
  id: string;
  schema: string;
  type: string;
  timestamp: number;
};

export abstract class Message<
  Payload extends TFlexible<unknown>,
  Metadata extends TFlexible<BaseMetadata>,
> {
  readonly payload: Payload;
  readonly metadata: Metadata;

  constructor(payload: Payload, metadata: Metadata) {
    this.payload = payload;
    this.metadata = metadata;
  }
}
