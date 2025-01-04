import { CachingStage, Cache } from './caching-stage';
import { Stage } from '../pipeline';

describe('CachingStage', () => {
  let mockCache: jest.Mocked<Cache>;
  let mockInnerStage: jest.Mocked<Stage<unknown, unknown>>;

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn()
    };

    mockInnerStage = {
      name: 'MockInnerStage',
      execute: jest.fn()
    };
  });

  describe('cache hits', () => {
    it('should return cached value when available', async () => {
      const cachedValue = { data: 'cached' };
      mockCache.get.mockResolvedValue(cachedValue);

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: (input: string) => input
      });

      const result = await stage.execute('test-key');

      expect(result).toBe(cachedValue);
      expect(mockInnerStage.execute).not.toHaveBeenCalled();
    });

    it('should compute and cache value when not available', async () => {
      const computedValue = { data: 'computed' };
      mockCache.get.mockResolvedValue(null);
      mockInnerStage.execute.mockResolvedValue(computedValue);

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: (input: string) => input,
        ttl: 3600
      });

      const result = await stage.execute('test-key');

      expect(result).toBe(computedValue);
      expect(mockCache.set).toHaveBeenCalledWith('test-key', computedValue, 3600);
    });
  });

  describe('key generation', () => {
    it('should generate correct cache key from input', async () => {
      mockCache.get.mockResolvedValue(null);

      const keyGenerator = jest.fn().mockReturnValue('generated-key');
      const stage = new CachingStage(mockInnerStage, mockCache, { keyGenerator });

      await stage.execute('test-input');

      expect(keyGenerator).toHaveBeenCalledWith('test-input');
      expect(mockCache.get).toHaveBeenCalledWith('generated-key');
    });

    it('should handle special characters in key generation', async () => {
      mockCache.get.mockResolvedValue(null);

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: (input: string) => input.replace(/[^a-zA-Z0-9]/g, '_')
      });

      await stage.execute('test@key#123');

      expect(mockCache.get).toHaveBeenCalledWith('test_key_123');
    });
  });

  describe('TTL handling', () => {
    it('should respect TTL when setting cache', async () => {
      mockCache.get.mockResolvedValue(null);
      mockInnerStage.execute.mockResolvedValue('value');

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: (input: string) => input,
        ttl: 1800
      });

      await stage.execute('test-key');

      expect(mockCache.set).toHaveBeenCalledWith('test-key', 'value', 1800);
    });

    it('should work without TTL', async () => {
      mockCache.get.mockResolvedValue(null);
      mockInnerStage.execute.mockResolvedValue('value');

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: (input: string) => input
      });

      await stage.execute('test-key');

      expect(mockCache.set).toHaveBeenCalledWith('test-key', 'value', undefined);
    });
  });

  describe('edge cases', () => {
    it('should handle null cache values gracefully', async () => {
      mockCache.get.mockResolvedValue(null);
      mockInnerStage.execute.mockResolvedValue('computed');

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: (input: string) => input
      });

      const result = await stage.execute('test-key');

      expect(result).toBe('computed');
    });

    it('should handle empty input data', async () => {
      mockCache.get.mockResolvedValue(null);

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: () => 'empty-key'
      });

      await stage.execute('');
      expect(mockCache.get).toHaveBeenCalledWith('empty-key');
    });

    it('should handle different data types', async () => {
      interface ComplexData {
        id: number;
        data: { value: string };
      }

      const complexValue: ComplexData = {
        id: 1,
        data: { value: 'test' }
      };

      mockCache.get.mockResolvedValue(null);
      mockInnerStage.execute.mockResolvedValue(complexValue);

      const stage = new CachingStage<ComplexData, ComplexData>(
        mockInnerStage as Stage<ComplexData, ComplexData>,
        mockCache,
        {
          keyGenerator: (input) => `${input.id}`
        }
      );

      const result = await stage.execute(complexValue);
      expect(result).toEqual(complexValue);
    });
  });

  describe('performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      let cacheValue: string | null = null;
      mockCache.get.mockImplementation(() => Promise.resolve(cacheValue));
      mockCache.set.mockImplementation(async (_, value) => {
        cacheValue = value as string;
        return Promise.resolve();
      });

      mockInnerStage.execute.mockResolvedValue('value');

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: (input: string) => input
      });

      const requests = Array(10).fill('same-key').map(key => stage.execute(key));
      const results = await Promise.all(requests);

      expect(mockInnerStage.execute).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(10);
      results.forEach(result => expect(result).toBe('value'));
    });

    it('should handle large data sets', async () => {
      const largeData = Array(1000).fill(0).map((_, i) => ({ id: i, value: `value${i}` }));
      mockCache.get.mockResolvedValue(null);
      mockInnerStage.execute.mockResolvedValue(largeData);

      const stage = new CachingStage(mockInnerStage, mockCache, {
        keyGenerator: () => 'large-key',
        ttl: 3600
      });

      const startTime = Date.now();
      await stage.execute('input');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(mockCache.set).toHaveBeenCalledWith('large-key', largeData, 3600);
    });
  });
});