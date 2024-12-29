import { BaseEntity } from './entity';

class TestEntity extends BaseEntity<string> {
  constructor(id: string, timestamper: { createdAt: string | Date | undefined; updatedAt: string | Date | undefined }, version: number) {
    super(id, timestamper, version);
  }
}

describe('TestEntity', () => {
  it('should handle createdAt as a valid string date format', () => {
    const entity = new TestEntity('1', { createdAt: '2023-05-01', updatedAt: undefined }, 0);
    expect(entity.timestamper.createdAt).toBe('2023-05-01');
  });


  it('should handle createdAt as a Date object', () => {
    const dateObj = new Date();
    const entity = new TestEntity('2', { createdAt: dateObj, updatedAt: undefined }, 0);
    expect(entity.timestamper.createdAt).toBe(dateObj);
  });

  it('should handle updatedAt as a valid string date format', () => {
    const entity = new TestEntity('4', { createdAt: undefined, updatedAt: '2023-05-02' }, 0);
    expect(entity.timestamper.updatedAt).toBe('2023-05-02');
  });

  it('should handle updatedAt as a Date object', () => {
    const dateObj = new Date();
    const entity = new TestEntity('5', { createdAt: undefined, updatedAt: dateObj }, 0);
    expect(entity.timestamper.updatedAt).toBe(dateObj);
  });

  it('should confirm createdAt is a valid date string', () => {
    const entity = new TestEntity('9', { createdAt: '2023-10-05', updatedAt: undefined }, 0);
    expect(typeof entity.timestamper.createdAt).toBe('string');
  });

  it('should confirm updatedAt is a valid date string', () => {
    const entity = new TestEntity('10', { createdAt: undefined, updatedAt: '2023-10-06' }, 0);
    expect(typeof entity.timestamper.updatedAt).toBe('string');
  });

  it('should confirm createdAt is a Date object', () => {
    const dateObj = new Date();
    const entity = new TestEntity('11', { createdAt: dateObj, updatedAt: undefined }, 0);
    expect(entity.timestamper.createdAt instanceof Date).toBeTruthy();
  });

  it('should confirm updatedAt is a Date object', () => {
    const dateObj = new Date();
    const entity = new TestEntity('12', { createdAt: undefined, updatedAt: dateObj }, 0);
    expect(entity.timestamper.updatedAt instanceof Date).toBeTruthy();
  });

  it('should confirm createdAt is a future date', () => {
    const futureDate = new Date(Date.now() + 1000000);
    const entity = new TestEntity('13', { createdAt: futureDate, updatedAt: undefined }, 0);
    expect((entity.timestamper.createdAt as Date).getTime()).toBeGreaterThan(Date.now());
  });

  it('should confirm updatedAt is a future date', () => {
    const futureDate = new Date(Date.now() + 1000000);
    const entity = new TestEntity('14', { createdAt: undefined, updatedAt: futureDate }, 0);
    expect((entity.timestamper.updatedAt as Date).getTime()).toBeGreaterThan(Date.now());
  });

  it('should confirm createdAt is a past date', () => {
    const pastDate = new Date(Date.now() - 1000000);
    const entity = new TestEntity('15', { createdAt: pastDate, updatedAt: undefined }, 0);
    expect((entity.timestamper.createdAt as Date).getTime()).toBeLessThan(Date.now());
  });

  it('should confirm updatedAt is a past date', () => {
    const pastDate = new Date(Date.now() - 1000000);
    const entity = new TestEntity('16', { createdAt: undefined, updatedAt: pastDate }, 0);
    expect((entity.timestamper.updatedAt as Date).getTime()).toBeLessThan(Date.now());
  });
});
