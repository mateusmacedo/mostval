export type TCreationOptions<T> = {
  [Property in keyof T]?: T[Property]
}

export interface IDIContainer {
  register<T>(token: symbol, instance: T): void
  resolve<T>(token: symbol): T
}

export interface IConstructable<T> {
  new (...args: any[]): T
}

export interface IFactory {
  create<T>(
    target: IConstructable<T>,
    props?: ConstructorParameters<typeof target>[0],
    optionTokens?: symbol[],
  ): T
}

export interface IPostCreationOption<T> {
  postCreate(instance: T): void
}

export interface IPreCreationOption<T> {
  preCreate<C extends IConstructable<T>>(props?: ConstructorParameters<C>[0]): void
}

export class BasicFactory implements IFactory {
  constructor(private container: IDIContainer) {}

  create<T>(
    target: IConstructable<T>,
    props?: ConstructorParameters<typeof target>[0],
    optionTokens?: symbol[],
  ): T {
    optionTokens?.forEach((token) => {
      const preOption: IPreCreationOption<T> = this.container.resolve(token)
      if ('preCreate' in preOption) {
        preOption.preCreate(props)
      }
    })

    const instance = new target(props)

    optionTokens?.forEach((token) => {
      const postOption: IPostCreationOption<T> = this.container.resolve(token)
      if ('postCreate' in postOption) {
        postOption.postCreate(instance)
      }
    })

    return instance
  }

  createMany<T>(
    target: IConstructable<T>,
    propsArray: ConstructorParameters<typeof target>[0][],
    optionTokens?: symbol[],
  ): T[] {
    return propsArray.map((props) => this.create(target, props, optionTokens))
  }
}
