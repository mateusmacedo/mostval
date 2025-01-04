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
      data.nested!.parent = data;

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
});