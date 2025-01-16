export type TGenericProps<T> = Partial<T>

export interface IPayload<T> {
  [field: string]: T
}

export interface IMeta<T> {
  [key: string]: T
}

export interface IMetadata {
  readonly schema: string
  readonly type: string
  readonly timestamp: number
  readonly id: string
}

export abstract class Message<Tpayload extends IPayload<any>, Tmetadata extends IMeta<any>> {
  readonly payload: Tpayload
  readonly metadata: Tmetadata

  constructor(payload: Tpayload, metadata: Tmetadata) {
    this.payload = payload
    this.metadata = metadata
  }
}
