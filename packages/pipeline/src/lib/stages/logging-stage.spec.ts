/*
eslint @typescript-eslint/no-explicit-any: 0
*/
import { LoggingStage, Logger } from './logging-stage';

describe('LoggingStage', () => {
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    };
  });

  describe('basic logging', () => {
    it('should log processing data when logData is true', async () => {
      const data = { id: 1, name: 'test' };
      const stage = new LoggingStage(mockLogger, { logData: true });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining(data)
      );
    });

    it('should not log data when logData is false', async () => {
      const data = { id: 1, name: 'test' };
      const stage = new LoggingStage(mockLogger, { logData: false });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        undefined
      );
    });

    it('should call logger.info exactly once', async () => {
      const stage = new LoggingStage(mockLogger);
      await stage.execute({ test: 'data' });

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('data masking', () => {
    it('should mask specified fields when logData is true', async () => {
      const data = {
        id: 1,
        name: 'test',
        password: 'secret',
        email: 'test@example.com'
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['password', 'email']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining({
          id: 1,
          name: 'test',
          password: '***',
          email: '***'
        })
      );
    });

    it('should not mask any fields when maskFields is empty', async () => {
      const data = { id: 1, name: 'test' };
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: []
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining(data)
      );
    });

    it('should not alter fields not specified in maskFields', async () => {
      const data = {
        id: 1,
        name: 'test',
        password: 'secret'
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['password']
      });

      const result = await stage.execute(data);

      expect(result).toEqual(data);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining({
          id: 1,
          name: 'test',
          password: '***'
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true });
      const result = await stage.execute({});

      expect(result).toEqual({});
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', {});
    });

    it('should handle null and undefined data', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true });

      await stage.execute(null as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', null);

      await stage.execute(undefined as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', undefined);
    });

    it('should handle nested objects', async () => {
      interface TestData {
        user: {
          id: number;
          credentials: {
            password: string;
            token: string;
          };
        };
      }

      const data: TestData = {
        user: {
          id: 1,
          credentials: {
            password: 'secret',
            token: '12345'
          }
        }
      };

      const stage = new LoggingStage<TestData>(mockLogger, {
        logData: true,
        maskFields: ['user']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining({
          user: '***'
        })
      );
    });

    it('should handle flattened sensitive data', async () => {
      interface Credentials {
        password: string;
        token: string;
      }

      interface TestData {
        credentials: Credentials;
        publicInfo: {
          id: number;
          name: string;
        };
      }

      const data: TestData = {
        credentials: {
          password: 'secret',
          token: '12345'
        },
        publicInfo: {
          id: 1,
          name: 'test'
        }
      };

      const stage = new LoggingStage<TestData>(mockLogger, {
        logData: true,
        maskFields: ['credentials']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining({
          credentials: '***',
          publicInfo: {
            id: 1,
            name: 'test'
          }
        })
      );
    });

    it('should handle circular references', async () => {
      interface TestData {
        id: number;
        secret: string;
        nested?: {
          value: string;
          parent?: TestData;
        };
      }

      const data: TestData = {
        id: 1,
        secret: 'sensitive',
        nested: {
          value: 'test',
          parent: undefined
        }
      };
      if (data.nested) {
        data.nested.parent = data;
      }

      const stage = new LoggingStage<TestData>(mockLogger, {
        logData: true,
        maskFields: ['secret', 'nested.value']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining({
          id: 1,
          secret: '***',
          nested: expect.objectContaining({
            value: '***'
          })
        })
      );
    });

    it('should support path arrays for complex keys', async () => {
      interface TestData {
        complex: {
          key: {
            secret: string;
          };
        };
      }

      const data: TestData = {
        complex: {
          key: {
            secret: 'sensitive'
          }
        }
      };

      const stage = new LoggingStage<TestData>(mockLogger, {
        logData: true,
        maskFields: ['complex.key.secret']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining({
          complex: {
            key: {
              secret: '***'
            }
          }
        })
      );
    });

    it('should handle non-object data types', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true });

      await stage.execute('string' as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', 'string');

      await stage.execute(123 as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', 123);

      await stage.execute(true as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', true);
    });

    it('should handle masking with complex paths', async () => {
      const data = {
        user: {
          id: 1,
          details: {
            password: 'secret',
            profile: {
              email: 'test@example.com'
            }
          }
        }
      } as any;

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['user.details.password', 'user.details.profile.email']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          user: {
            id: 1,
            details: {
              password: '***',
              profile: {
                email: '***'
              }
            }
          }
        }
      );
    });

    it('should handle arrays with wildcard masking', async () => {
      const data = {
        users: [
          { id: 1, password: 'secret1' },
          { id: 2, password: 'secret2' }
        ]
      } as any;

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['users.*.password']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          users: [
            { id: 1, password: '***' },
            { id: 2, password: '***' }
          ]
        }
      );
    });

    it('should not apply mask if object is not an object', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true, maskFields: ['nonexistent'] });

      await stage.execute(null as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', null);

      await stage.execute(123 as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', 123);
    });

    it('should apply mask to all elements in an array when using wildcard', async () => {
      const data = {
        users: [
          { id: 1, password: 'secret1' },
          { id: 2, password: 'secret2' }
        ]
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['users.*.password']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          users: [
            { id: 1, password: '***' },
            { id: 2, password: '***' }
          ]
        }
      );
    });

    it('should not mask if path does not exist', async () => {
      const data = {
        user: {
          id: 1,
          name: 'test'
        }
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['user.nonexistent']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          user: {
            id: 1,
            name: 'test'
          }
        }
      );
    });

    it('should handle masking with wildcard at the end of path', async () => {
      const data = {
        user: {
          id: 1,
          details: {
            password: 'secret',
            profile: {
              email: 'test@example.com'
            }
          }
        }
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['user.details.password', 'user.details.profile.email']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          user: {
            id: 1,
            details: {
              password: '***',
              profile: {
                email: '***'
              }
            }
          }
        }
      );
    });
  });

  describe('performance', () => {
    it('should handle large objects efficiently', async () => {
      interface LargeObject {
        [key: string]: string;
      }

      const largeObject: LargeObject = {};
      const sensitiveFields: string[] = [];

      for (let i = 0; i < 1000; i++) {
        largeObject[`field${i}`] = `value${i}`;
        if (i % 2 === 0) {
          sensitiveFields.push(`field${i}`);
        }
      }

      const stage = new LoggingStage<LargeObject>(mockLogger, {
        logData: true,
        maskFields: sensitiveFields
      });

      const startTime = Date.now();
      await stage.execute(largeObject);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(mockLogger.info).toHaveBeenCalledTimes(1);

      const loggedData = mockLogger.info.mock.calls[0][1] as LargeObject;
      expect(loggedData['field0']).toBe('***');
      expect(loggedData['field1']).toBe('value1');
    });
  });

  describe('return values', () => {
    it('should always return the original data unchanged', async () => {
      const data = {
        id: 1,
        name: 'test',
        password: 'secret'
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['password']
      });

      const result = await stage.execute(data);

      expect(result).toBe(data); // Check reference equality
      expect(result.password).toBe('secret'); // Check value not masked in original
    });
  });

  describe('complex data masking', () => {
    it('should mask nested fields using dot notation', async () => {
      interface TestData {
        user: {
          id: number;
          credentials: {
            password: string;
            token: string;
          };
        };
      }

      const data: TestData = {
        user: {
          id: 1,
          credentials: {
            password: 'secret',
            token: '12345'
          }
        }
      };

      const stage = new LoggingStage<TestData>(mockLogger, {
        logData: true,
        maskFields: ['user.credentials.password', 'user.credentials.token']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          user: {
            id: 1,
            credentials: {
              password: '***',
              token: '***'
            }
          }
        }
      );
    });

    it('should mask array elements', async () => {
      interface TestData {
        users: Array<{
          id: number;
          password: string;
        }>;
      }

      const data: TestData = {
        users: [
          { id: 1, password: 'secret1' },
          { id: 2, password: 'secret2' }
        ]
      };

      const stage = new LoggingStage<TestData>(mockLogger, {
        logData: true,
        maskFields: ['users.*.password']
      });

      await stage.execute(data);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        expect.objectContaining({
          users: [
            { id: 1, password: '***' },
            { id: 2, password: '***' }
          ]
        })
      );
    });
  });

  describe('applyFinalMask scenarios', () => {
    it('should apply final mask to object fields', async () => {
      const data = {
        user: {
          id: 1,
          password: 'secret'
        }
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['user.password']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          user: {
            id: 1,
            password: '***'
          }
        }
      );
    });

    it('should apply final mask to all elements in an array', async () => {
      const data = {
        users: [
          { id: 1, password: 'secret1' },
          { id: 2, password: 'secret2' }
        ]
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['users.*.password']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          users: [
            { id: 1, password: '***' },
            { id: 2, password: '***' }
          ]
        }
      );
    });

    it('should not apply final mask if path does not exist', async () => {
      const data = {
        user: {
          id: 1,
          name: 'test'
        }
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['user.nonexistent']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          user: {
            id: 1,
            name: 'test'
          }
        }
      );
    });
  });

  describe('applyFinalMask and applyMaskToNestedObjects scenarios', () => {
    it('should apply final mask to array elements using wildcard', async () => {
      const data = {
        items: ['secret1', 'secret2', 'secret3']
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['items.*']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          items: ['***', '***', '***']
        }
      );
    });

    it('should apply mask to nested objects', async () => {
      const data = {
        user: {
          profile: {
            email: 'test@example.com',
            password: 'secret'
          }
        }
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['user.profile.password']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          user: {
            profile: {
              email: 'test@example.com',
              password: '***'
            }
          }
        }
      );
    });

    it('should apply mask to all nested objects using wildcard', async () => {
      const data = {
        users: [
          { profile: { email: 'user1@example.com', password: 'secret1' } },
          { profile: { email: 'user2@example.com', password: 'secret2' } }
        ]
      };

      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['users.*.profile.password']
      });

      await stage.execute(data as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {
          users: [
            { profile: { email: 'user1@example.com', password: '***' } },
            { profile: { email: 'user2@example.com', password: '***' } }
          ]
        }
      );
    });
  });

  describe('maskSensitiveData scenarios', () => {
    it('should return the same value for null', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true });

      const result = await stage.execute(null as any);
      expect(result).toBeNull();
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', null);
    });

    it('should return the same value for undefined', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true });

      const result = await stage.execute(undefined as any);
      expect(result).toBeUndefined();
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', undefined);
    });

    it('should return the same value for primitive types', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true });

      const stringResult = await stage.execute('string' as any);
      expect(stringResult).toBe('string');
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', 'string');

      const numberResult = await stage.execute(123 as any);
      expect(numberResult).toBe(123);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', 123);

      const booleanResult = await stage.execute(true as any);
      expect(booleanResult).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', true);
    });
  });

  describe('applyMask scenarios', () => {
    it('should not apply mask if obj is null', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true, maskFields: ['nonexistent'] });

      await stage.execute(null as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', null);
    });

    it('should not apply mask if obj is undefined', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true, maskFields: ['nonexistent'] });

      await stage.execute(undefined as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', undefined);
    });

    it('should not apply mask if obj is a primitive type', async () => {
      const stage = new LoggingStage(mockLogger, { logData: true, maskFields: ['nonexistent'] });

      await stage.execute('string' as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', 'string');

      await stage.execute(123 as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', 123);

      await stage.execute(true as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', true);
    });

    it('should handle falsy values other than null and undefined', async () => {
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['field']
      });

      await stage.execute(0 as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', 0);

      await stage.execute('' as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', '');

      await stage.execute(false as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', false);
    });

    it('should handle non-object types', async () => {
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['field']
      });

      const fn = () => {
        return null;
      };
      await stage.execute(fn as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', fn);

      const symbol = Symbol('test');
      await stage.execute(symbol as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', symbol);

      const bigint = BigInt(123);
      await stage.execute(bigint as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', bigint);
    });

    it('should handle special numeric values', async () => {
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['field']
      });

      await stage.execute(NaN as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', NaN);

      await stage.execute(Infinity as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', Infinity);

      await stage.execute(-Infinity as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', -Infinity);
    });
  });

  describe('applyMask edge cases', () => {
    it('should handle empty objects', async () => {
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['field']
      });

      await stage.execute({} as any);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing data', {});
    });

    it('should handle arrays as objects', async () => {
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['0']
      });

      const data = ['secret'];
      await stage.execute(data as any);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        ['***']
      );
    });

    it('should handle Date objects', async () => {
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['getTime']
      });

      const date = new Date();
      await stage.execute(date as any);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        {}
      );
    });

    it('should handle objects with null prototype', async () => {
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['secret']
      });

      const obj = Object.create(null);
      obj.secret = 'value';
      await stage.execute(obj as any);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        { secret: '***' }
      );
    });

    it('should handle objects with custom prototype', async () => {
      const stage = new LoggingStage(mockLogger, {
        logData: true,
        maskFields: ['secret']
      });

      class Custom {
        secret = 'value';
      }
      const obj = new Custom();
      await stage.execute(obj as any);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing data',
        { secret: '***' }
      );
    });
  });
});