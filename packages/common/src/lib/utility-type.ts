/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------
// Constructor Types
// ---------------------------------------
export type AbstractConstructor<T> = abstract new (...args: any[]) => T;

/**
 * Interface representing something "constructable" (newable),
 * from an AbstractConstructor.
 */
export interface IConstructable<T extends AbstractConstructor<unknown>> {
  new (...args: ConstructorParameters<T>): InstanceType<T>;
}

/**
 * Custom version of "Constructor" that requires T to be newable,
 * creating an instance of type "InstanceType<T>".
 *
 * To enforce that the constructor always receives at least one parameter,
 * use `TAtLeastOne<ConstructorParameters<T>>`.
 */
export type TConstructable<T extends abstract new (...args: any[]) => any> = {
  new (...args: ConstructorParameters<T>): InstanceType<T>;
};

// ---------------------------------------
// Property Manipulation Types
// ---------------------------------------

/**
 * TFlexible: Makes only the keys K of T optional
 * (equivalent to Partial<Pick<T, K>>).
 */
export type TFlexible<T, K extends keyof T = keyof T> = {
  [P in K]?: T[P];
};

/**
 * TAtLeastOne: Produces a union of objects where each variant includes
 * EXACTLY one key of T.
 * (Note: If you want "at least one, but others may exist",
 * another type like RequireAtLeastOne is needed.)
 */
export type TAtLeastOne<T> = {
  [K in keyof T]-?: Pick<T, K>;
}[keyof T];

/**
 * RequireAtLeastOne: Ensures that AT LEAST ONE of the keys `Keys`
 * is required, while others may be optional.
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * RequireExactlyOne: Requires that EXACTLY ONE of the keys `Keys`
 * is defined, and others cannot coexist.
 */
export type RequireExactlyOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]: Pick<T, K> & Partial<Record<Exclude<Keys, K>, never>>;
}[Keys] &
  Pick<T, Exclude<keyof T, Keys>>;

// ---------------------------------------
// "Deep" (Recursive) Types
// ---------------------------------------

/**
 * DeepPartial: Makes all properties (at all levels) optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * DeepReadonly: Applies Readonly recursively to all properties of T.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * DeepRequired: Removes `undefined` from all properties (at all levels).
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// ---------------------------------------
// Miscellaneous Utility Types
// ---------------------------------------

/**
 * Resolved: If T is a Promise, extracts the internal type (the "resolve").
 * Otherwise, returns T.
 */
export type Resolved<T> = T extends Promise<infer U> ? U : T;

/**
 * FnParameters: Extracts the parameter tuple of a function.
 * (TypeScript already has a built-in ‘Parameters<T>’.
 * If overriding, change the name to avoid conflict.)
 */
export type FnParameters<T> = T extends (...args: infer U) => unknown
  ? U
  : never;

/**
 * ConstructableOrInstance:
 * Can be a constructor (IConstructable<T>) or the instance T itself.
 */
export type ConstructableOrInstance<T extends AbstractConstructor<unknown>> =
  | IConstructable<T>
  | T;

/**
 * Merge: "Merges" two types, overriding the keys of N onto M.
 */
export type Merge<M, N> = Omit<M, keyof N> & N;
