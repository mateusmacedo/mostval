import { TEntityWithTimestamps } from './entity';

class TestEntity implements TEntityWithTimestamps<string, number> {
  constructor(readonly id: string, readonly version: number, readonly createdAt: Date, readonly updatedAt: Date) {}
}

describe('TEntityWithTimestamps', () => {
  it('should handle version as a valid number and timestamps as valid dates', () => {
    const entity = new TestEntity('1', 0, new Date(), new Date());
    expect(entity.id).toBe('1');
    expect(entity.version).toBe(0);
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });
});
