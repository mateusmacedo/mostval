import { TEntity } from './entity';

class TestEntity implements TEntity<string, number> {
  constructor(readonly id: string, readonly version: number) {}
}

describe('TestEntity', () => {
  it('should handle version as a valid number', () => {
    const entity = new TestEntity('1', 0);
    expect(entity.id).toBe('1');
    expect(entity.version).toBe(0);
  });
});
