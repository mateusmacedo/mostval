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
    test('should create value object with correct value', () => {
        const value = 'test';
        const vo = new TestStringValueObject(value);
        expect(vo.value).toBe(value);
    });

    test('should return true when comparing equal value objects', () => {
        const vo1 = new TestStringValueObject('test');
        const vo2 = new TestStringValueObject('test');
        expect(vo1.equals(vo2)).toBe(true);
    });

    test('should return false when comparing different value objects', () => {
        const vo1 = new TestStringValueObject('test1');
        const vo2 = new TestStringValueObject('test2');
        expect(vo1.equals(vo2)).toBe(false);
    });

    test('should return false when comparing with null', () => {
        const vo = new TestStringValueObject('test');
        expect(vo.equals(null as any)).toBe(false);
    });

    test('should return false when comparing with undefined', () => {
        const vo = new TestStringValueObject('test');
        expect(vo.equals(undefined as any)).toBe(false);
    });

    test('should convert to string correctly', () => {
        const value = 'test';
        const vo = new TestStringValueObject(value);
        expect(vo.toString()).toBe(value);
    });
});

describe('TestComplexNestedValueObject', () => {
    test('should create value object with correct value', () => {
        const value = { value: 'test', nested: { value: 1 } };
        const vo = new TestComplexNestedValueObject(value);
        expect(vo.value).toBe(value);
    });

    test('should return true when comparing equal value objects', () => {
        const vo1 = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        const vo2 = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        expect(vo1.equals(vo2)).toBe(true);
    });

    test('should return false when comparing different value objects', () => {
        const vo1 = new TestComplexNestedValueObject({ value: 'test1', nested: { value: 1 } });
        const vo2 = new TestComplexNestedValueObject({ value: 'test2', nested: { value: 2 } });
        expect(vo1.equals(vo2)).toBe(false);
    });

    test('should return false when comparing with null', () => {
        const vo = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        expect(vo.equals(null as any)).toBe(false);
    });

    test('should return false when comparing with undefined', () => {
        const vo = new TestComplexNestedValueObject({ value: 'test', nested: { value: 1 } });
        expect(vo.equals(undefined as any)).toBe(false);
    });

    test('should convert to string correctly', () => {
        const value = { value: 'test', nested: { value: 1 } };
        const vo = new TestComplexNestedValueObject(value);
        expect(vo.toString()).toBe(JSON.stringify(value));
    });

    test('should be able to access nested properties', () => {
        const value = { value: 'test', nested: { value: 1 } };
        const vo = new TestComplexNestedValueObject(value);
        expect(vo.value.nested.value).toBe(1);
    });
});
