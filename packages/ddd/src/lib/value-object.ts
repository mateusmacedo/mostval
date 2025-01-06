export interface IValueObject<T> {
  getValue(): T;
  equals(other: IValueObject<T>): boolean;
  toString(): string;
  toJSON(): string;
}

export abstract class ValueObject<T> implements IValueObject<T> {

    constructor(private readonly value: T) {
    }

    getValue(): T {
      return this.value;
    }

    equals(other: IValueObject<T>): boolean {
      if (other === null || other === undefined) {
        return false;
      }
      if (typeof this.value === 'object' && typeof other.getValue() === 'object') {
        return JSON.stringify(this.value) === JSON.stringify(other.getValue());
      }
      return this.value === other.getValue();
    }

    toString(): string {
      if (typeof this.value === 'object') {
        return JSON.stringify(this.value);
      }
      return String(this.value);
    }

    toJSON(): string {
      return JSON.stringify(this.value);
    }
  }
