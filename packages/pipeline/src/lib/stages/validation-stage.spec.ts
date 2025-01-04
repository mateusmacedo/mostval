import { ValidationStage, ValidationRule, ValidationError } from './validation-stage';

describe('ValidationStage', () => {
  describe('basic validation', () => {
    it('should pass validation when no rules are violated', async () => {
      const notEmptyRule: ValidationRule<string> = {
        async validate(data: string): Promise<string[]> {
          return data.length > 0 ? [] : ['String cannot be empty'];
        }
      };

      const validationStage = new ValidationStage([notEmptyRule]);
      const result = await validationStage.execute('valid string');
      expect(result).toBe('valid string');
    });

    it('should throw ValidationError when validation fails', async () => {
      const notEmptyRule: ValidationRule<string> = {
        async validate(data: string): Promise<string[]> {
          return data.length > 0 ? [] : ['String cannot be empty'];
        }
      };

      const validationStage = new ValidationStage([notEmptyRule]);
      await expect(validationStage.execute('')).rejects.toThrow(ValidationError);
    });

    it('should collect all validation errors', async () => {
      const lengthRule: ValidationRule<string> = {
        async validate(data: string): Promise<string[]> {
          return data.length >= 3 ? [] : ['String must be at least 3 characters'];
        }
      };

      const uppercaseRule: ValidationRule<string> = {
        async validate(data: string): Promise<string[]> {
          return /[A-Z]/.test(data) ? [] : ['String must contain uppercase letters'];
        }
      };

      const validationStage = new ValidationStage([lengthRule, uppercaseRule]);

      try {
        await validationStage.execute('ab');
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).validationErrors).toHaveLength(2);
        expect((error as ValidationError).validationErrors).toContain('String must be at least 3 characters');
        expect((error as ValidationError).validationErrors).toContain('String must contain uppercase letters');
      }
    });
  });

  describe('complex validation', () => {
    interface TestData {
      id: number;
      name: string;
    }

    it('should validate complex objects', async () => {
      const idRule: ValidationRule<TestData> = {
        async validate(data: TestData): Promise<string[]> {
          return data.id > 0 ? [] : ['ID must be positive'];
        }
      };

      const nameRule: ValidationRule<TestData> = {
        async validate(data: TestData): Promise<string[]> {
          const errors: string[] = [];
          if (data.name.length === 0) errors.push('Name cannot be empty');
          if (data.name.length < 3) errors.push('Name must be at least 3 characters');
          return errors;
        }
      };

      const validationStage = new ValidationStage<TestData, TestData>([idRule, nameRule]);

      // Valid data
      const validData: TestData = { id: 1, name: 'John' };
      const result = await validationStage.execute(validData);
      expect(result).toEqual(validData);

      // Invalid data
      const invalidData: TestData = { id: -1, name: 'J' };
      try {
        await validationStage.execute(invalidData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).validationErrors).toContain('ID must be positive');
        expect((error as ValidationError).validationErrors).toContain('Name must be at least 3 characters');
      }
    });
  });

  describe('error handling', () => {
    it('should handle validation errors through handleError method', async () => {
      const validationStage = new ValidationStage([]);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const validationError = new ValidationError('Test error', ['Error 1']);

      await expect(
        validationStage.handleError(validationError, 'test data')
      ).rejects.toBe(validationError);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Validation errors:',
        ['Error 1']
      );

      consoleSpy.mockRestore();
    });

    it('should handle non-validation errors correctly', async () => {
      const validationStage = new ValidationStage<string, string>([]);
      const genericError = new Error('Generic error');
      const result = await validationStage.handleError(genericError, 'fallback data');
      expect(result).toBe('fallback data');
    });
  });
});
