export interface IValueObject<T> {
  value: T;
  equals(other: IValueObject<T>): boolean;
  toString(): string;
  toJSON(): string;
}

export abstract class ValueObject<T> implements IValueObject<T> {
    public readonly value: T;

    constructor(value: T) {
      this.value = value;
    }

    public equals(other: IValueObject<T>): boolean {
      if (other === null || other === undefined) {
        return false;
      }
      if (typeof this.value === 'object' && typeof other.value === 'object') {
        return JSON.stringify(this.value) === JSON.stringify(other.value);
      }
      return this.value === other.value;
    }

    public toString(): string {
      if (typeof this.value === 'object') {
        return JSON.stringify(this.value);
      }
      return String(this.value);
    }

    public toJSON(): string {
      return JSON.stringify(this.value);
    }
  }
