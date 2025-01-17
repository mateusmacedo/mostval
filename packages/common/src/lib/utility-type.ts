export type TGenericPartial<T> = Partial<T>;

export type TFlexible<T, K extends keyof T = keyof T> = {
  [P in K]?: T[P];
};

export type TAtLeastOne<T> = {
  [K in keyof T]-?: Pick<T, K>;
}[keyof T];

export type TConstructable<
  T extends abstract new (...args: unknown[]) => unknown,
> = {
  new (...args: TAtLeastOne<ConstructorParameters<T>>): T;
};
