import { IValueObject } from '@mostval/ddd';
import { IValidator } from '@mostval/common';

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
    toString(): string {
        return this.value.email;
    }
    toJSON(): string {
        return JSON.stringify(this.value);
    }
}

export class InvalidEmailError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidEmailError';
    }
}

export class EmailValidator implements IValidator<TEmail> {
    validate(email: TEmail): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.email);
    }
}

export class EmailService {

    constructor(private validator: IValidator<TEmail>) {
    }

    createEmail(email: TEmail): Email {
        if (!this.validator.validate(email)) {
            throw new InvalidEmailError('Invalid email');
        }
        return new Email(email);
    }

    isEmail(email: TEmail): boolean {
        return this.validator.validate(email);
    }
}