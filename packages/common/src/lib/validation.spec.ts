import { ArrayValidationRule, ObjectValidationRule, ValidationResult, ValidationRule } from './validation';

// Criando um mock simples para ValidationRule
class MockValidationRule implements ValidationRule {
  constructor(public ruleCallback: (input: any) => ValidationResult) {}
  validate(input: any): ValidationResult {
    return this.ruleCallback(input);
  }
}

describe('ObjectValidationRule', () => {
  it('should validate object properties correctly', () => {
    const rule = new ObjectValidationRule({
      name: new MockValidationRule((input) => ({ success: typeof input === 'string', errors: [] }))
    });

    const validResult = rule.validate({ name: 'John Doe' });
    expect(validResult.success).toBeTruthy();
    expect(validResult.errors.length).toBe(0);

    const invalidResult = rule.validate({ name: 123 }); // Invalid type
    expect(invalidResult.success).toBeFalsy();
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  it('should return an error for non-object inputs', () => {
    const rule = new ObjectValidationRule({});
    const result = rule.validate('not an object');
    expect(result.success).toBeFalsy();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('ArrayValidationRule', () => {
  const rule = new ArrayValidationRule(new MockValidationRule((input) => {
    const isNumber = typeof input === 'number'
    const errors = isNumber ? [] : [`${input} is not a number`]
    return { success: isNumber, errors }
  }));

  it('should validate array elements correctly', () => {
    const validResult = rule.validate([1, 2, 3]);
    expect(validResult.success).toBeTruthy();
    expect(validResult.errors.length).toBe(0);

    const invalidResult = rule.validate([1, 'two', 3]); // 'two' is not a number
    expect(invalidResult.success).toBeFalsy();
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  it('should return an error for non-array inputs', () => {
    const result = rule.validate('not an array');
    expect(result.success).toBeFalsy();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
