import { SanitizationStage, SanitizationRule, SanitizationError } from './sanitization-stage';

describe('SanitizationStage', () => {
  describe('basic sanitization', () => {
    it('should correctly sanitize a string field', async () => {
      const rule: SanitizationRule<{ text: string }> = {
        field: 'text',
        sanitize: value => String(value).trim().toLowerCase()
      };

      const stage = new SanitizationStage([rule]);
      const result = await stage.execute({ text: '  Hello World  ' });
      expect(result.text).toBe('hello world');
    });

    it('should correctly sanitize a number field', async () => {
      const rule: SanitizationRule<{ value: number }> = {
        field: 'value',
        sanitize: value => Math.abs(Number(value))
      };

      const stage = new SanitizationStage([rule]);
      const result = await stage.execute({ value: -42 });
      expect(result.value).toBe(42);
    });

    it('should correctly sanitize a boolean field', async () => {
      const rule: SanitizationRule<{ active: boolean }> = {
        field: 'active',
        sanitize: value => Boolean(value)
      };

      const stage = new SanitizationStage([rule]);
      const result = await stage.execute({ active: 1 as any });
      expect(result.active).toBe(true);
    });
  });

  describe('multiple rules', () => {
    it('should apply multiple rules in sequence', async () => {
      interface TestData {
        name: string;
        age: number;
      }

      const rules: SanitizationRule<TestData>[] = [
        {
          field: 'name',
          sanitize: value => String(value).trim()
        },
        {
          field: 'age',
          sanitize: value => Math.max(0, Number(value))
        }
      ];

      const stage = new SanitizationStage(rules);
      const result = await stage.execute({ name: '  John  ', age: -5 });
      expect(result).toEqual({ name: 'John', age: 0 });
    });

    it('should not modify fields not specified in rules', async () => {
      interface TestData {
        name: string;
        age: number;
        email: string;
      }

      const rules: SanitizationRule<TestData>[] = [
        {
          field: 'name',
          sanitize: value => String(value).trim()
        }
      ];

      const input = { name: '  John  ', age: 25, email: 'john@example.com' };
      const stage = new SanitizationStage(rules);
      const result = await stage.execute(input);

      expect(result.name).toBe('John');
      expect(result.age).toBe(25);
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined values', async () => {
      interface TestData {
        name: string | null;
        age: number | undefined;
      }

      const rules: SanitizationRule<TestData>[] = [
        {
          field: 'name',
          sanitize: value => value === null ? '' : String(value)
        },
        {
          field: 'age',
          sanitize: value => value === undefined ? 0 : Number(value)
        }
      ];

      const stage = new SanitizationStage(rules);
      const result = await stage.execute({ name: null, age: undefined });
      expect(result).toEqual({ name: '', age: 0 });
    });

    it('should handle empty objects', async () => {
      const stage = new SanitizationStage<Record<string, never>>([]);
      const result = await stage.execute({});
      expect(result).toEqual({});
    });

    it('should handle array values', async () => {
      interface TestData {
        tags: string[];
      }

      const rule: SanitizationRule<TestData> = {
        field: 'tags',
        sanitize: value => (value as string[]).map(tag => tag.trim().toLowerCase())
      };

      const stage = new SanitizationStage([rule]);
      const result = await stage.execute({ tags: ['  TAG1  ', 'Tag2  ', '  tag3'] });
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });

  describe('error handling', () => {
    it('should throw SanitizationError when sanitization fails', async () => {
      interface TestData {
        value: number;
      }

      const rule: SanitizationRule<TestData> = {
        field: 'value',
        sanitize: () => { throw new Error('Sanitization failed'); }
      };

      const stage = new SanitizationStage([rule]);
      await expect(stage.execute({ value: 42 }))
        .rejects
        .toThrow(SanitizationError);
    });

    it('should include field name in error message', async () => {
      interface TestData {
        email: string;
      }

      const rule: SanitizationRule<TestData> = {
        field: 'email',
        sanitize: () => { throw new Error('Invalid email'); }
      };

      const stage = new SanitizationStage([rule]);
      try {
        await stage.execute({ email: 'invalid' });
        fail('Should have thrown SanitizationError');
      } catch (error) {
        if (error instanceof SanitizationError) {
          expect(error.message).toContain('email');
          expect(error.field).toBe('email');
        } else {
          fail('Error should be instance of SanitizationError');
        }
      }
    });
  });

  describe('performance', () => {
    it('should handle large objects efficiently', async () => {
      interface LargeObject {
        [key: string]: string;
      }

      const largeObject: LargeObject = {};
      const rules: SanitizationRule<LargeObject>[] = [];

      // Create large object and rules
      for (let i = 0; i < 1000; i++) {
        const key = `field${i}`;
        largeObject[key] = `  value${i}  `;
        rules.push({
          field: key,
          sanitize: value => String(value).trim()
        });
      }

      const stage = new SanitizationStage(rules);
      const startTime = Date.now();
      const result = await stage.execute(largeObject);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
      expect(result['field0']).toBe('value0');
      expect(result['field999']).toBe('value999');
    });
  });
});