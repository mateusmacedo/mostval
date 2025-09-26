export type Candidate<T> = T | T[];

export interface Specification<T> {
  isSatisfiedBy(candidate: Candidate<T>): boolean;
}

export abstract class BaseSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: Candidate<T>): boolean;

  and(spec: Specification<T>): BaseSpecification<T> {
    return new AndSpecification<T>(this, spec);
  }

  or(spec: Specification<T>): BaseSpecification<T> {
    return new OrSpecification<T>(this, spec);
  }

  not(): BaseSpecification<T> {
    return new NotSpecification<T>(this);
  }
}

export class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private spec1: Specification<T>,
    private spec2: Specification<T>,
  ) {
    super();
  }

  isSatisfiedBy(candidate: Candidate<T>): boolean {
    return this.spec1.isSatisfiedBy(candidate) && this.spec2.isSatisfiedBy(candidate);
  }
}

export class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private spec1: Specification<T>,
    private spec2: Specification<T>,
  ) {
    super();
  }

  isSatisfiedBy(candidate: Candidate<T>): boolean {
    return this.spec1.isSatisfiedBy(candidate) || this.spec2.isSatisfiedBy(candidate);
  }
}

export class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private spec: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: Candidate<T>): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
