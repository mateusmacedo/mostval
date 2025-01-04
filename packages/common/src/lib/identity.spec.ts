import { createIdentity, createTimestampedIdentity, TIdetityWithTimestamps } from './identity';

describe('entity', () => {
  describe('createEntity', () => {
    it('should create an entity with the correct id and version', () => {
      const entity = createIdentity('123', 1);
      expect(entity.id).toBe('123');
      expect(entity.version).toBe(1);
    });
  });

  describe('createTimestampedEntity', () => {
    it('should create an entity with the correct id, version, createdAt, and updatedAt', () => {
      const entity = createTimestampedIdentity('123', 1);
      expect(entity.id).toBe('123');
      expect(entity.version).toBe(1);
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });
  });
});
