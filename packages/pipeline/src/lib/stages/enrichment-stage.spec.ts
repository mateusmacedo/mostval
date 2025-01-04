import { EnrichmentStage, EnrichmentSource, EnrichmentError } from './enrichment-stage';

describe('EnrichmentStage', () => {
  describe('basic enrichment', () => {
    it('should execute successfully with valid input data', async () => {
      const source: EnrichmentSource<string, string> = {
        name: 'TestSource',
        enrich: async (data) => data.toUpperCase()
      };

      const stage = new EnrichmentStage(source);
      const result = await stage.execute('test');
      expect(result).toBe('TEST');
    });

    it('should call enrich function exactly once', async () => {
      const enrichSpy = jest.fn().mockResolvedValue('enriched');
      const source: EnrichmentSource<string, string> = {
        name: 'TestSource',
        enrich: enrichSpy
      };

      const stage = new EnrichmentStage(source);
      await stage.execute('test');
      expect(enrichSpy).toHaveBeenCalledTimes(1);
      expect(enrichSpy).toHaveBeenCalledWith('test');
    });

    it('should handle complex data transformations', async () => {
      interface InputData {
        id: number;
        name: string;
      }
      interface OutputData {
        id: number;
        name: string;
        timestamp: number;
      }

      const source: EnrichmentSource<InputData, OutputData> = {
        name: 'ComplexSource',
        enrich: async (data) => ({
          ...data,
          timestamp: Date.now()
        })
      };

      const stage = new EnrichmentStage(source);
      const result = await stage.execute({ id: 1, name: 'test' });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'test');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should throw EnrichmentError when source fails', async () => {
      const source: EnrichmentSource<unknown, never> = {
        name: 'FailingSource',
        enrich: async () => { throw new Error('Source error'); }
      };

      const stage = new EnrichmentStage(source);
      await expect(stage.execute({}))
        .rejects
        .toThrow(EnrichmentError);
    });

    it('should include source name in error message', async () => {
      const source: EnrichmentSource<unknown, never> = {
        name: 'CustomSource',
        enrich: async () => { throw new Error('Test error'); }
      };

      const stage = new EnrichmentStage(source);
      try {
        await stage.execute({});
        fail('Should have thrown EnrichmentError');
      } catch (error) {
        if (error instanceof EnrichmentError) {
          expect(error.message).toContain('CustomSource');
          expect(error.source).toBe('CustomSource');
        } else {
          fail('Error should be instance of EnrichmentError');
        }
      }
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined input', async () => {
      const source: EnrichmentSource<unknown, string> = {
        name: 'NullHandler',
        enrich: async (data) => data === null ? 'null' : 'undefined'
      };

      const stage = new EnrichmentStage(source);
      expect(await stage.execute(null)).toBe('null');
      expect(await stage.execute(undefined)).toBe('undefined');
    });

    it('should handle empty objects', async () => {
      const source: EnrichmentSource<object, object> = {
        name: 'EmptyHandler',
        enrich: async (data) => ({ ...data, enriched: true })
      };

      const stage = new EnrichmentStage(source);
      const result = await stage.execute({});
      expect(result).toEqual({ enriched: true });
    });

    it('should process special characters correctly', async () => {
      const source: EnrichmentSource<string, string> = {
        name: 'SpecialCharsHandler',
        enrich: async (data) => data.replace(/[^a-zA-Z0-9]/g, '_')
      };

      const stage = new EnrichmentStage(source);
      const result = await stage.execute('test@123#');
      expect(result).toBe('test_123_');
    });
  });

  describe('performance', () => {
    it('should handle large data efficiently', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      const source: EnrichmentSource<number[], number> = {
        name: 'LargeDataHandler',
        enrich: async (data) => data.reduce((sum, num) => sum + num, 0)
      };

      const stage = new EnrichmentStage(source);
      const startTime = Date.now();
      const result = await stage.execute(largeArray);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result).toBe(49995000); // Sum of numbers 0 to 9999
    });

    it('should handle concurrent executions', async () => {
      let counter = 0;
      const source: EnrichmentSource<number, number> = {
        name: 'ConcurrentHandler',
        enrich: async (data) => {
          counter++;
          await new Promise(resolve => setTimeout(resolve, 10));
          return data * 2;
        }
      };

      const stage = new EnrichmentStage(source);
      const executions = Array.from({ length: 10 }, (_, i) =>
        stage.execute(i)
      );

      const results = await Promise.all(executions);
      expect(counter).toBe(10);
      expect(results).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
    });
  });

  describe('state management', () => {
    it('should maintain source state across executions', async () => {
      let state = 0;
      const source: EnrichmentSource<number, number> = {
        name: 'StatefulSource',
        enrich: async (data) => {
          state += data;
          return state;
        }
      };

      const stage = new EnrichmentStage(source);
      expect(await stage.execute(1)).toBe(1);
      expect(await stage.execute(2)).toBe(3);
      expect(await stage.execute(3)).toBe(6);
    });
  });
});