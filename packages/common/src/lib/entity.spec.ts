import { BaseEntity, IVersion } from './entity';

class TestEntity extends BaseEntity<string> {
  constructor(id: string, timestamper: { createdAt: string | Date | number | undefined; updatedAt: string | Date | number | undefined }, version: IVersion) {
      super(id, timestamper, version);
    }
}

describe('TestEntity', () => {
  it('should handle createdAt as a valid string date format', () => {
    const entity = new TestEntity('1', { createdAt: '2023-05-01', updatedAt: undefined }, { version: 0 });
    expect(entity.timestamper.createdAt).toBe('2023-05-01');
  });

  it('should handle createdAt as a Date object', () => {
    const dateObj = new Date();
    const entity = new TestEntity('2', { createdAt: dateObj, updatedAt: undefined }, { version: 0 });
    expect(entity.timestamper.createdAt).toBe(dateObj);
  });

  it('should handle updatedAt as a valid string date format', () => {
    const entity = new TestEntity('4', { createdAt: undefined, updatedAt: '2023-05-02' }, { version: 0 });
    expect(entity.timestamper.updatedAt).toBe('2023-05-02');
  });

  it('should handle updatedAt as a Date object', () => {
    const dateObj = new Date();
    const entity = new TestEntity('5', { createdAt: undefined, updatedAt: dateObj }, { version: 0 });
    expect(entity.timestamper.updatedAt).toBe(dateObj);
  });

  it('should confirm createdAt is a valid date string', () => {
    const entity = new TestEntity('9', { createdAt: '2023-10-05', updatedAt: undefined }, { version: 0 });
    expect(typeof entity.timestamper.createdAt).toBe('string');
  });

  it('should confirm updatedAt is a valid date string', () => {
    const entity = new TestEntity('10', { createdAt: undefined, updatedAt: '2023-10-06' }, { version: 0 });
    expect(typeof entity.timestamper.updatedAt).toBe('string');
  });

  it('should confirm createdAt is a Date object', () => {
    const dateObj = new Date();
    const entity = new TestEntity('11', { createdAt: dateObj, updatedAt: undefined }, { version: 0 });
    expect(entity.timestamper.createdAt instanceof Date).toBeTruthy();
  });

  it('should confirm updatedAt is a Date object', () => {
    const dateObj = new Date();
    const entity = new TestEntity('12', { createdAt: undefined, updatedAt: dateObj }, { version: 0 });
    expect(entity.timestamper.updatedAt instanceof Date).toBeTruthy();
  });

  it('should confirm createdAt is a future date', () => {
    const futureDate = new Date(Date.now() + 1000000);
    const entity = new TestEntity('13', { createdAt: futureDate, updatedAt: undefined }, { version: 0 });
    expect((entity.timestamper.createdAt as Date).getTime()).toBeGreaterThan(Date.now());
  });

  it('should confirm updatedAt is a future date', () => {
    const futureDate = new Date(Date.now() + 1000000);
    const entity = new TestEntity('14', { createdAt: undefined, updatedAt: futureDate }, { version: 0 });
    expect((entity.timestamper.updatedAt as Date).getTime()).toBeGreaterThan(Date.now());
  });

  it('should confirm createdAt is a past date', () => {
    const pastDate = new Date(Date.now() - 1000000);
    const entity = new TestEntity('15', { createdAt: pastDate, updatedAt: undefined }, { version: 0 });
    expect((entity.timestamper.createdAt as Date).getTime()).toBeLessThan(Date.now());
  });

  it('should confirm updatedAt is a past date', () => {
    const pastDate = new Date(Date.now() - 1000000);
    const entity = new TestEntity('16', { createdAt: undefined, updatedAt: pastDate }, { version: 0 });
    expect((entity.timestamper.updatedAt as Date).getTime()).toBeLessThan(Date.now());
  });

  it('should handle createdAt as a numeric timestamp', () => {
    const numericTimestamp = Date.now();
    const entity = new TestEntity('60', { createdAt: numericTimestamp, updatedAt: undefined }, { version: 2 });
    expect(entity.timestamper.createdAt).toBe(numericTimestamp);
  });

  it('should handle updatedAt as a numeric timestamp', () => {
    const numericTimestamp = Date.now();
    const entity = new TestEntity('61', { createdAt: undefined, updatedAt: numericTimestamp }, { version: 2 });
    expect(entity.timestamper.updatedAt).toBe(numericTimestamp);
  });

  it('should confirm version is set correctly', () => {
    const entity = new TestEntity('70', { createdAt: undefined, updatedAt: undefined }, { version: 5 });
    expect(entity.version).toEqual({ version: 5 });
  });
});
