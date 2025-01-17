import { ValueObject } from './value-object'
// Test implementation class
class TestStringValueObject extends ValueObject<string> {
    constructor(value: string) {
        super(value);
    }
}

type ComplextNestedValueObject = {
    value: string;
    nested: {
        value: number;
    };
};

class TestComplexNestedValueObject extends ValueObject<ComplextNestedValueObject> {
    constructor(value: ComplextNestedValueObject) {
        super(value);
    }
}

describe('ValueObject', () => {
    it('should be able to create with empty object when no value is provided', () => {
        const vo = new TestStringValueObject(undefined as unknown as string);
        expect(vo.getValue()).toEqual({});
    });

    it('should return false when comparing with null', () => {
        const vo = new TestStringValueObject('test');
        expect(vo.equals(null as unknown as TestStringValueObject)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
        const vo = new TestStringValueObject('test');
        expect(vo.equals(undefined as unknown as TestStringValueObject)).toBe(false);
    });

    it('should return false when comparing with different type', () => {
        const vo = new TestStringValueObject('test');
        expect(vo.equals(1 as unknown as TestStringValueObject)).toBe(false);
    });

    it('should create value object with correct value', () => {
        const value = 'test';
        const vo = new TestStringValueObject(value);
        expect(vo.getValue()).toBe(value);
    });

    it('should return true when comparing equal value objects', () => {
        const vo1 = new TestStringValueObject('test');
        const vo2 = new TestStringValueObject('test');
        expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false when comparing different value objects', () => {
        const vo1 = new TestStringValueObject('test1');
        const vo2 = new TestStringValueObject('test2');
        expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false when comparing different value objects', () => {
        const vo1 = new TestComplexNestedValueObject({ value: 'test1', nested: { value: 1 } });
        const vo2 = new TestComplexNestedValueObject({ value: 'test2', nested: { value: 2 } });
        expect(vo1.equals(vo2)).toBe(false);
    });

    it('should convert to string correctly', () => {
        const value = 'test';
        const vo = new TestStringValueObject(value);
        expect(vo.asString()).toBe(value);
    });

    it('should create value object with correct value', () => {
        const value = { value: 'test', nested: { value: 1 } };
        const vo = new TestComplexNestedValueObject(value);
        expect(vo.getValue()).toBe(value);
    });

    it('should return true when comparing equal value objects', () => {
        const vo1 = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        const vo2 = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false when comparing different value objects', () => {
        const vo1 = new TestComplexNestedValueObject({ value: 'test1', nested: { value: 1 } });
        const vo2 = new TestComplexNestedValueObject({ value: 'test2', nested: { value: 2 } });
        expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false when objects have different numbers of properties', () => {
        const vo1 = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        const vo2 = new TestComplexNestedValueObject({ value: 'test' } as ComplextNestedValueObject);
        expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
        const vo = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        expect(vo.equals(null as unknown as TestComplexNestedValueObject)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
        const vo = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        expect(vo.equals(undefined as unknown as TestComplexNestedValueObject)).toBe(false);
    });

    it('should convert to string correctly', () => {
        const value = { value: 'test', nested: { value: 1 } };
        const vo = new TestComplexNestedValueObject(value);
        expect(vo.asString()).toBe(JSON.stringify(value));
    });

    it('should convert to JSON correctly', () => {
        const value = { value: 'test', nested: { value: 1 } };
        const vo = new TestComplexNestedValueObject(value);
        expect(vo.asJSON()).toBe(JSON.stringify(value));
    });

    it('should be able to access nested properties', () => {
        const value = { value: 'test', nested: { value: 1 } };
        const vo = new TestComplexNestedValueObject(value);
        expect(vo.getValue().nested.value).toBe(1);
    });
});
