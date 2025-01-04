import { TransformationStage, TransformationError } from './transformation-stage';

describe('TransformationStage', () => {
  describe('basic configuration', () => {
    it('should have correct stage name', () => {
      const stage = new TransformationStage((x: number) => x * 2);
      expect(stage.name).toBe('TransformationStage');
    });
  });

  describe('execution', () => {
    it('should transform data synchronously', async () => {
      const stage = new TransformationStage<number, string>(x => x.toString());
      const result = await stage.execute(42);
      expect(result).toBe('42');
    });

    it('should transform data asynchronously', async () => {
      const stage = new TransformationStage<number, number>(
        async x => new Promise(resolve => setTimeout(() => resolve(x * 2), 10))
      );
      const result = await stage.execute(5);
      expect(result).toBe(10);
    });

    it('should handle complex object transformations', async () => {
      interface Input { value: number }
      interface Output { result: string }

      const stage = new TransformationStage<Input, Output>(
        data => ({ result: `Value is ${data.value}` })
      );

      const result = await stage.execute({ value: 42 });
      expect(result).toEqual({ result: 'Value is 42' });
    });

    it('should wrap errors in TransformationError', async () => {
      const stage = new TransformationStage<unknown, never>(() => {
        throw new Error('Original error');
      });

      try {
        await stage.execute({});
        fail('Should have thrown TransformationError');
      } catch (error) {
        expect(error).toBeInstanceOf(TransformationError);
        expect((error as TransformationError).message).toBe('Transformation failed');
        expect((error as TransformationError).originalError.message).toBe('Original error');
      }
    });
  });

  describe('error handling', () => {
    it('should log and rethrow TransformationError', async () => {
      const stage = new TransformationStage<string, string>(x => x);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const error = new TransformationError('Test error', new Error('Original'));

      await expect(
        stage.handleError(error, 'test data')
      ).rejects.toBe(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Transformation errors:',
        error.originalError
      );

      consoleSpy.mockRestore();
    });

    it('should return context for non-transformation errors', async () => {
      const stage = new TransformationStage<string, string>(x => x);
      const error = new Error('Generic error');
      const result = await stage.handleError(error, 'fallback data');
      expect(result).toBe('fallback data');
    });

    it('should handle non-Error throws', async () => {
      const stage = new TransformationStage<unknown, never>(() => {
        throw 'string error';
      });

      try {
        await stage.execute({});
        fail('Should have thrown TransformationError');
      } catch (error) {
        expect(error).toBeInstanceOf(TransformationError);
        expect((error as TransformationError).message).toBe('Transformation failed');
        expect((error as TransformationError).originalError.message).toBe('string error');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined inputs', async () => {
      const stage = new TransformationStage<null | undefined, string>(
        x => x === null ? 'null' : 'undefined'
      );

      expect(await stage.execute(null)).toBe('null');
      expect(await stage.execute(undefined)).toBe('undefined');
    });

    it('should handle empty transformations', async () => {
      const stage = new TransformationStage<unknown, unknown>(x => x);
      const input = { test: 'data' };
      const result = await stage.execute(input);
      expect(result).toBe(input);
    });

    it('should handle async transformer rejection', async () => {
      const stage = new TransformationStage<unknown, never>(
        () => Promise.reject(new Error('Async error'))
      );

      await expect(stage.execute({}))
        .rejects
        .toMatchObject({
          message: 'Transformation failed',
          originalError: expect.objectContaining({
            message: 'Async error'
          })
        });
    });
  });
});
