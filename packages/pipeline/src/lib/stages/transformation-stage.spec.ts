import { TransformationStage } from './transformation-stage';

describe('TransformationStage', () => {
  describe('basic transformations', () => {
    it('should transform string to uppercase', async () => {
      const toUpperCase = (input: string) => input.toUpperCase();
      const stage = new TransformationStage<string, string>(toUpperCase);

      const result = await stage.execute('hello');
      expect(result).toBe('HELLO');
    });

    it('should transform number to string', async () => {
      const toString = (input: number) => input.toString();
      const stage = new TransformationStage<number, string>(toString);

      const result = await stage.execute(42);
      expect(result).toBe('42');
    });

    it('should handle async transformations', async () => {
      const asyncTransformer = (input: number): Promise<number> => {
        return Promise.resolve(input * 2);
      };
      const stage = new TransformationStage<number, Promise<number>>(asyncTransformer);

      const result = await stage.execute(5);
      expect(result).toBe(10);
    });
  });

  describe('complex transformations', () => {
    interface InputType {
      name: string;
      age: number;
    }

    interface OutputType {
      fullName: string;
      isAdult: boolean;
    }

    it('should transform complex objects', async () => {
      const complexTransformer = (input: InputType): OutputType => ({
        fullName: `Mr/Ms ${input.name}`,
        isAdult: input.age >= 18
      });

      const stage = new TransformationStage<InputType, OutputType>(complexTransformer);

      const result = await stage.execute({ name: 'John', age: 25 });
      expect(result).toEqual({
        fullName: 'Mr/Ms John',
        isAdult: true
      });
    });

    it('should handle null transformations', async () => {
      type InputType = string | number | boolean;
      const nullTransformer = () => null;
      const stage = new TransformationStage<InputType, null>(nullTransformer);

      const result = await stage.execute('any input');
      expect(result).toBeNull();
    });

    it('should handle error cases', async () => {
      const errorTransformer = () => {
        throw new Error('Transformation failed');
      };
      const stage = new TransformationStage<string, never>(errorTransformer);

      await expect(stage.execute('test')).rejects.toThrow('Transformation failed');
    });
  });

  describe('chaining transformations', () => {
    it('should handle multiple transformations in sequence', async () => {
      const numberToString = new TransformationStage<number, string>(
        (n: number) => n.toString()
      );
      const stringToArray = new TransformationStage<string, string[]>(
        (s: string) => s.split('')
      );

      const firstResult = await numberToString.execute(123);
      const finalResult = await stringToArray.execute(firstResult);

      expect(finalResult).toEqual(['1', '2', '3']);
    });
  });
});
