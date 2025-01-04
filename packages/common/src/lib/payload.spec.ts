import { Payload } from './payload';

class PayloadSpec extends Payload {
    constructor(timestamp: Date, issuerId?: string) {
        super(timestamp, issuerId);
    }
}

describe('Payload', () => {
    it('should be able to create a payload', () => {
        const payload = new PayloadSpec(new Date(), '123');
        expect(payload).toBeDefined();
    });

    it('should be able to create a payload with issuerId', () => {
        const payload = new PayloadSpec(new Date(), '123');
        expect(payload.issuerId).toBe('123');
    });

    it('should be able to create a payload with timestamp', () => {
        const payload = new PayloadSpec(new Date(), '123');
        expect(payload.timestamp).toBeDefined();
    });
});
