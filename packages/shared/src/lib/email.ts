import { IValueObject } from '@mostval/ddd';
import { ValidationRule, ValidationResult } from '@mostval/common';

export type TEmail = {
    readonly email: string;
}

export class Email implements IValueObject<TEmail> {
    constructor(readonly value: TEmail) {
    }
    getValue(): TEmail {
        return this.value;
    }
    equals(other: IValueObject<TEmail>): boolean {
        if (other === null || other === undefined) {
            return false;
        }
        if (typeof this.value === 'object' && typeof other.getValue() === 'object') {
            return JSON.stringify(this.value) === JSON.stringify(other.getValue());
        }
        return this.value === other.getValue();
    }
    asString(): string {
        return this.value.email;
    }
    asJSON(): string {
        return JSON.stringify(this.value);
    }
}

export class InvalidEmailError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidEmailError';
    }
}

export class EmailValidator implements ValidationRule<TEmail> {
    validate(email: TEmail, path = ''): ValidationResult {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.email);
        return {
            success: isValid,
            errors: isValid ? [] : [`${path}email: Invalid email format`]
        };
    }
}

export class EmailService {

    constructor(private validator: ValidationRule<TEmail>) {
    }

    createEmail(email: TEmail): Email {
        const validationResult = this.validator.validate(email);
        if (!validationResult.success) {
            throw new InvalidEmailError('Invalid email: ' + validationResult.errors.join(', '));
        }
        return new Email(email);
    }

    isEmail(email: TEmail): boolean {
        return this.validator.validate(email).success;
    }
}