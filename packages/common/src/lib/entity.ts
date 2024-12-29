export interface Timestamper {
  createdAt:  string | Date | undefined;
  updatedAt: Date | string | undefined;
}

export interface Entity {
  id: string | number
  timestamper: Timestamper
  version: number
}

export abstract class BaseEntity implements Entity {
  constructor(
    public readonly id: string | number,
    public readonly timestamper: Timestamper,
    public readonly version: number
  ) {}
}
