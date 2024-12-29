import { Result } from './result';

describe('Result', () => {
  describe('Ok', () => {
    it('should create a successful result', () => {
      const result = Result.Ok(42);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.getValue()).toBe(42);
    });

    it('should work with different value types', () => {
      const stringResult = Result.Ok('test');
      expect(stringResult.getValue()).toBe('test');

      const objectResult = Result.Ok({ key: 'value' });
      expect(objectResult.getValue()).toEqual({ key: 'value' });

      const arrayResult = Result.Ok([1, 2, 3]);
      expect(arrayResult.getValue()).toEqual([1, 2, 3]);
    });

    it('should throw when trying to get error from Ok result', () => {
      const result = Result.Ok(42);
      expect(() => result.getError()).toThrow('Cannot get the error of a successful result.');
    });
  });

  describe('Err', () => {
    it('should create an error result', () => {
      const error = new Error('test error');
      const result = Result.Err(error);
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it('should work with different error types', () => {
      const stringError = Result.Err('error message');
      expect(stringError.getError()).toBe('error message');

      const customError = Result.Err({ code: 404, message: 'Not Found' });
      expect(customError.getError()).toEqual({ code: 404, message: 'Not Found' });
    });

    it('should throw when trying to get value from Err result', () => {
      const result = Result.Err(new Error('test error'));
      expect(() => result.getValue()).toThrow('Cannot get the value of an error result.');
    });
  });

  describe('type guards', () => {
    it('should narrow types correctly with isOk', () => {
      const result: Result<number, Error> = Result.Ok(42);
      if (result.isOk()) {
        // TypeScript should recognize this as Result<number, never>
        const value: number = result.getValue();
        expect(value).toBe(42);
      }
    });

    it('should narrow types correctly with isErr', () => {
      const result: Result<number, Error> = Result.Err(new Error('test'));
      if (result.isErr()) {
        // TypeScript should recognize this as Result<never, Error>
        const error: Error = result.getError();
        expect(error.message).toBe('test');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle undefined as Ok value', () => {
      const result = Result.Ok(undefined);
      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toBeUndefined();
    });

    it('should handle null as Ok value', () => {
      const result = Result.Ok(null);
      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toBeNull();
    });

    it('should handle undefined as Err value', () => {
      const result = Result.Err(undefined);
      expect(result.isErr()).toBe(true);
      expect(result.getError()).toBeUndefined();
    });

    it('should handle null as Err value', () => {
      const result = Result.Err(null);
      expect(result.isErr()).toBe(true);
      expect(result.getError()).toBeNull();
    });
  });
}); 