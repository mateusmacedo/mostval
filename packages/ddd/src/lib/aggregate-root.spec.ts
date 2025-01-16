import { AggregateRoot } from './aggregate-root';

class AggregateRootSpec extends AggregateRoot<string, number> {
    constructor(id: string, version: number, createdAt: Date, updatedAt: Date) {
        super(id, version, createdAt, updatedAt);
    }
}

describe('AggregateRoot', () => {
    it('should be able to create an aggregate root', () => {
        const aggregateRoot = new AggregateRootSpec('123', 1, new Date(), new Date());
        expect(aggregateRoot).toBeDefined();
    });
});
