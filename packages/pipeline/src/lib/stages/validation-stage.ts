import { Stage } from '../stage';


export class ValidationStage<T> implements Stage<T, T> {
  constructor(private validator: (data: T) => boolean) {}

  async execute(data: T): Promise<T> {
    const isValid = this.validator(data);
    if (!isValid) {
      throw new Error('Invalid data: value cannot be null, undefined or empty string');
    }
    return data;
  }
}
