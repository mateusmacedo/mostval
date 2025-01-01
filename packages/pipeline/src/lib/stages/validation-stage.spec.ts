import { ValidationStage } from './validation-stage';

type ValidationType = string | number | object | null | undefined;
type Validator<T> = (data: T) => boolean;

describe('ValidationStage', () => {
  describe('with default validator', () => {
    let validationStage: ValidationStage<ValidationType>;
    const defaultValidator: Validator<ValidationType> = (data) =>
      data !== null &&
      data !== undefined &&
      data !== '';

    beforeEach(() => {
      validationStage = new ValidationStage(defaultValidator);
    });

    it('should pass validation with valid string data', async () => {
      const testData = 'valid string';
      const result = await validationStage.execute(testData);
      expect(result).toBe(testData);
    });

    it('should pass validation with valid number data', async () => {
      const testData = 42;
      const result = await validationStage.execute(testData);
      expect(result).toBe(testData);
    });

    it('should pass validation with valid object data', async () => {
      const testData = { key: 'value' };
      const result = await validationStage.execute(testData);
      expect(result).toBe(testData);
    });

    it('should throw error for null data', async () => {
      await expect(validationStage.execute(null)).rejects.toThrow(
        'Invalid data: value cannot be null, undefined or empty string'
      );
    });

    it('should throw error for undefined data', async () => {
      await expect(validationStage.execute(undefined)).rejects.toThrow(
        'Invalid data: value cannot be null, undefined or empty string'
      );
    });

    it('should throw error for empty string data', async () => {
      await expect(validationStage.execute('')).rejects.toThrow(
        'Invalid data: value cannot be null, undefined or empty string'
      );
    });
  });

  describe('with custom validator', () => {
    it('should use custom validation logic', async () => {
      const customValidator: Validator<number> = (data) => data > 0;
      const validationStage = new ValidationStage<number>(customValidator);

      // Should pass for positive numbers
      const result = await validationStage.execute(5);
      expect(result).toBe(5);

      // Should throw for zero or negative numbers
      await expect(validationStage.execute(0)).rejects.toThrow('Invalid data');
      await expect(validationStage.execute(-1)).rejects.toThrow('Invalid data');
    });

    it('should handle complex validation logic', async () => {
      interface TestData {
        id: number;
        name: string;
      }

      const complexValidator: Validator<TestData> = (data) =>
        data.id > 0 && data.name.length > 0;

      const validationStage = new ValidationStage<TestData>(complexValidator);

      // Valid data
      const validData: TestData = { id: 1, name: 'test' };
      const result = await validationStage.execute(validData);
      expect(result).toEqual(validData);

      // Invalid data
      const invalidData: TestData = { id: -1, name: '' };
      await expect(validationStage.execute(invalidData)).rejects.toThrow('Invalid data');
    });
  });
});
