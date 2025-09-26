export interface IValueObject<T extends Partial<T>> {
  getValue(): T;
  equals(other: IValueObject<T>): boolean;
  asString(): string;
  asJSON(): string;
}

export class ValueObject<T extends Partial<T>> implements IValueObject<T> {
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

    return this.compareProps(this.getValue(), other.getValue());
  }

  private compareProps(props1: Partial<T>, props2: Partial<T>): boolean {
    const keys1 = Object.keys(props1) as Array<keyof T>;
    const keys2 = Object.keys(props2) as Array<keyof T>;

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      const val1 = props1[key];
      const val2 = props2[key];

      const areObjects = this.isObject(val1) && this.isObject(val2);
      if (
        (areObjects &&
          !this.compareProps(val1 as Partial<T>, val2 as Partial<T>)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
    return true;
  }

  private isObject(obj: unknown): boolean {
    return obj !== null && typeof obj === 'object';
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
