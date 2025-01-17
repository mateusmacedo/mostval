// 🔶 Tipo para construtores abstratos ou concretos
export type AbstractConstructor<T = unknown> = abstract new (
  ...args: unknown[]
) => T;

// 🔶 Contrato para construtores
export interface IConstructable<T extends AbstractConstructor<unknown>> {
  new (...args: ConstructorParameters<T>): InstanceType<T>;
}

// 🔶 Interface para gerenciamento de dependências
export interface IDIContainer {
  register<T extends AbstractConstructor<unknown>>(
    token: symbol,
    provider: IConstructable<T> | InstanceType<T>
  ): void;
  resolve<T>(token: symbol): T;
}

// 🔶 Interface de fábrica para criação de instâncias
export interface IFactory {
  create<T extends AbstractConstructor<unknown>>(
    target: IConstructable<T>,
    args?: ConstructorParameters<T>,
    optionTokens?: symbol[]
  ): InstanceType<T>;

  createMany<T extends AbstractConstructor<unknown>>(
    target: IConstructable<T>,
    argsArray: ConstructorParameters<T>[],
    optionTokens?: symbol[]
  ): InstanceType<T>[];
}

// 🔶 Hook de pós-criação
export interface IPostCreationOption<T> {
  postCreate(instance: T): void;
}

// 🔶 Hook de pré-criação
export interface IPreCreationOption<T extends AbstractConstructor<unknown>> {
  preCreate<C extends IConstructable<T>>(args?: ConstructorParameters<C>): void;
}

// 🔶 Interface para descarte de recursos
export interface IDestroyable {
  onDestroy(): void;
}

// 🔶 Type Guards para validação de hooks
function isPreCreationOption<T extends AbstractConstructor<unknown>>(
  obj: unknown
): obj is IPreCreationOption<T> {
  return typeof (obj as IPreCreationOption<T>)?.preCreate === 'function';
}

function isPostCreationOption<T>(obj: unknown): obj is IPostCreationOption<T> {
  return typeof (obj as IPostCreationOption<T>)?.postCreate === 'function';
}

// 🔶 Implementação robusta da Fábrica
export class BasicFactory implements IFactory {
  constructor(private container: IDIContainer) {}

  create<T extends AbstractConstructor<unknown>>(
    target: IConstructable<T>,
    args: ConstructorParameters<T> = [] as unknown as ConstructorParameters<T>,
    optionTokens: symbol[] = []
  ): InstanceType<T> {
    // 🛠️ Pré-Criação com validação
    optionTokens.forEach((token) => {
      const option = this.container.resolve<IPreCreationOption<T>>(token);
      if (isPreCreationOption(option)) {
        try {
          option.preCreate(args);
        } catch (error) {
          console.error(`Erro em preCreate: ${error}`);
          throw error;
        }
      }
    });

    // 🏗️ Criação da instância
    const instance = new target(...args);

    // 🛠️ Pós-Criação com validação
    optionTokens.forEach((token) => {
      const option =
        this.container.resolve<IPostCreationOption<InstanceType<T>>>(token);
      if (isPostCreationOption(option)) {
        try {
          option.postCreate(instance);
        } catch (error) {
          console.error(`Erro em postCreate: ${error}`);
        }
      }
    });

    return instance;
  }

  createMany<T extends AbstractConstructor<unknown>>(
    target: IConstructable<T>,
    argsArray: ConstructorParameters<T>[],
    optionTokens?: symbol[]
  ): InstanceType<T>[] {
    return argsArray.map((args) => this.create(target, args, optionTokens));
  }
}

// 🔶 Implementação simples do contêiner de dependências
export class SimpleDIContainer implements IDIContainer {
  private registry = new Map<symbol, unknown>();

  register<T extends AbstractConstructor<unknown>>(
    token: symbol,
    provider: IConstructable<T> | InstanceType<T>
  ): void {
    this.registry.set(token, provider);
  }

  resolve<T>(token: symbol): T {
    const provider = this.registry.get(token);
    if (!provider) {
      throw new Error(`Token não registrado: ${token.toString()}`);
    }
    return provider as T;
  }
}
