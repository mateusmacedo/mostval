export type ValueObjectProps<T> = {
  [Property in keyof T]?: T[Property];
};
export interface IValueObject<T extends ValueObjectProps<T>> {
  getValue(): T;
  equals(other: IValueObject<T>): boolean;
  asString(): string;
  asJSON(): string;
}

export abstract class ValueObject<T extends ValueObjectProps<T>> implements IValueObject<T> {

    constructor(protected readonly value: T) {
      this.value = Object.freeze(value || ({} as T));
    }

    getValue(): T {
      return this.value;
    }

    equals(other: IValueObject<T>): boolean {
      if (other === null || other === undefined) {
        return false;
      }

      if (this.constructor.name !== other.constructor.name) {
        return false;
      }

      if (typeof this.value === 'object' && typeof other.getValue() === 'object') {
        return this.asJSON() === other.asJSON();
      }

      return this.getValue() === other.getValue();
    }

    asString(): string {
      if (typeof this.value === 'object') {
        return JSON.stringify(this.value);
      }
      return String(this.value);
    }

    asJSON(): string {
      return JSON.stringify(this.value);
    }
  }
