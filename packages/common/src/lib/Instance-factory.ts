/* --------------------------------------------------
 * 🔶 Tipo para construtores abstratos ou concretos
 * -------------------------------------------------- */
export type AbstractConstructor<T = unknown> = abstract new (
  ...args: any[]
) => T;

/* --------------------------------------------------
 * 🔶 Contrato para construtores
 * -------------------------------------------------- */
export interface IConstructable<T extends AbstractConstructor<unknown>> {
  new (...args: ConstructorParameters<T>): InstanceType<T>;
}

/* --------------------------------------------------
 * 🔶 Interface para descarte de recursos
 * -------------------------------------------------- */
export interface IDestroyable {
  onDestroy(): void;
}

/* --------------------------------------------------
 * 🔶 Hook de pós-criação
 * -------------------------------------------------- */
export interface IPostCreationOption<T> {
  postCreate(instance: T): void;
}

/* --------------------------------------------------
 * 🔶 Hook de pré-criação
 * -------------------------------------------------- */
export interface IPreCreationOption<T extends AbstractConstructor<unknown>> {
  preCreate<C extends IConstructable<T>>(args?: ConstructorParameters<C>): void;
}

/* --------------------------------------------------
 * 🔶 Interface de Logger Agnóstico
 *
 * Pode ser adaptada para bibliotecas como Winston,
 * Pino, Bunyan, ou até mesmo a API de Logger do NestJS.
 * -------------------------------------------------- */
export interface ILogger {
  error(message: string, error?: unknown): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
  // Adicione outros níveis de log (fatal, trace, etc.) se necessário.
}

/* --------------------------------------------------
 * 🔶 Type Guards para validação de hooks
 * -------------------------------------------------- */
function isPreCreationOption<T extends AbstractConstructor<unknown>>(
  obj: unknown
): obj is IPreCreationOption<T> {
  return typeof (obj as IPreCreationOption<T>)?.preCreate === 'function';
}

function isPostCreationOption<T>(obj: unknown): obj is IPostCreationOption<T> {
  return typeof (obj as IPostCreationOption<T>)?.postCreate === 'function';
}

/* --------------------------------------------------
 * 🔶 Enum de Escopo de Registro
 *    - Singleton: Instância única por token.
 *    - Transient: Nova instância sempre que requisitado.
 * -------------------------------------------------- */
export enum RegistrationScope {
  Singleton = 'SINGLETON',
  Transient = 'TRANSIENT',
}

/* --------------------------------------------------
 * 🔶 Interface auxiliar para registro no container
 * -------------------------------------------------- */
interface IRegistration<T extends AbstractConstructor<unknown>> {
  scope: RegistrationScope;
  provider: IConstructable<T> | InstanceType<T>;
  /**
   * Instância gerada no caso de escopo Singleton.
   * Armazenada para reutilização em subsequentes `resolve`.
   */
  instance?: InstanceType<T>;
}

/* --------------------------------------------------
 * 🔶 Interface para gerenciamento de dependências
 *    - Suporte a diferentes escopos (Singleton, Transient)
 *    - Registra e resolve tokens
 *    - Descarte opcional de recursos
 * -------------------------------------------------- */
export interface IDIContainer {
  register<T extends AbstractConstructor<unknown>>(
    token: symbol,
    provider: IConstructable<T> | InstanceType<T>,
    scope?: RegistrationScope
  ): void;
  resolve<T>(token: symbol): T;
  destroy(token: symbol): void;
}

/* --------------------------------------------------
 * 🔶 Interface de fábrica para criação de instâncias
 * -------------------------------------------------- */
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

/*
 * --------------------------------------------------
 * 🔶 Type guard que verifica se o objeto é "constructable"
 *    Ou seja, se realmente pode ser chamado com `new`
 * --------------------------------------------------
 */
function isConstructable(
  obj: unknown
): obj is IConstructable<AbstractConstructor<unknown>> {
  return typeof obj === 'function';
}

/* --------------------------------------------------
 * 🔶 Implementação robusta da Fábrica
 * -------------------------------------------------- */
export class BasicFactory implements IFactory {
  constructor(
    private readonly container: IDIContainer,
    private readonly logger: ILogger
  ) {}

  create<T extends AbstractConstructor<unknown>>(
    target: IConstructable<T>,
    args: ConstructorParameters<T> = [] as unknown as ConstructorParameters<T>,
    optionTokens: symbol[] = []
  ): InstanceType<T> {
    // 1) Hooks de pré-criação
    optionTokens.forEach((token) => {
      const option = this.container.resolve<IPreCreationOption<T>>(token);
      if (isPreCreationOption(option)) {
        try {
          option.preCreate(args);
        } catch (error) {
          this.logger.error(
            `Erro em preCreate para token: ${String(token)}`,
            error
          );
          throw error;
        }
      }
    });

    // 2) Criação da instância propriamente dita
    let instance: InstanceType<T>;
    try {
      instance = new target(...args);
    } catch (error) {
      this.logger.error(`Erro ao instanciar ${target.name}`, error);
      throw error;
    }

    // 3) Hooks de pós-criação
    optionTokens.forEach((token) => {
      const option =
        this.container.resolve<IPostCreationOption<InstanceType<T>>>(token);
      if (isPostCreationOption(option)) {
        try {
          option.postCreate(instance);
        } catch (error) {
          this.logger.error(
            `Erro em postCreate para token: ${String(token)}`,
            error
          );
          // Não é obrigatório relançar o erro; fica a critério da lógica do projeto.
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

/* --------------------------------------------------
 * 🔶 Implementação do contêiner de dependências
 * -------------------------------------------------- */
export class SimpleDIContainer implements IDIContainer {
  private registry = new Map<symbol, IRegistration<any>>();

  constructor(private readonly logger: ILogger) {}

  register<T extends AbstractConstructor<unknown>>(
    token: symbol,
    provider: IConstructable<T> | InstanceType<T>,
    scope: RegistrationScope = RegistrationScope.Transient
  ): void {
    // Garante que a chave será única no registry
    this.registry.set(token, { scope, provider });
  }

  resolve<T>(token: symbol): T {
    const registration = this.registry.get(token);
    if (!registration) {
      throw new Error(`Token não registrado: ${String(token)}`);
    }

    // Se for Singleton e já tiver instância criada, retorna a mesma
    if (registration.scope === RegistrationScope.Singleton) {
      if (!registration.instance) {
        // Cria e armazena
        registration.instance = this.instantiate<T>(registration.provider);
      }
      return registration.instance;
    }

    // Se for Transient, cria nova instância sempre
    return this.instantiate<T>(registration.provider);
  }

  /**
   * Destrói o recurso atrelado ao token, se existente.
   * Isso é útil quando se quer liberar recursos de Singletons
   * ou instâncias que precisem ser manualmente descartadas.
   */
  destroy(token: symbol): void {
    const registration = this.registry.get(token);
    if (!registration) {
      this.logger.warn(
        `destroy chamado para token não registrado: ${String(token)}`
      );
      return;
    }

    // Verifica se existe instância e se implementa IDestroyable
    const instance = registration.instance;
    if (instance && this.isDestroyable(instance)) {
      try {
        instance.onDestroy();
        this.logger.info(`Instância destruída para token: ${String(token)}`);
      } catch (error) {
        this.logger.error(
          `Erro ao destruir instância do token: ${String(token)}`,
          error
        );
      }
    }

    // Remove da lista de registro
    this.registry.delete(token);
  }

  /* ----------------------------------------
   * Método auxiliar para instanciar classe
   * ou retornar uma instância já criada
   * ---------------------------------------- */
  private instantiate<T>(
    provider: IConstructable<AbstractConstructor<unknown>> | T
  ): T {
    // Se for construtor, chama `new`
    if (isConstructable(provider)) {
      // Aqui, provider é IConstructable<AbstractConstructor<unknown>>
      // Convertendo o retorno para T para manter a compatibilidade.
      return new provider() as T;
    }

    // Se não for construtor, simplesmente retornamos como instância
    return provider;
  }

  /* --------------------------------------------------
   * Verifica se objeto implementa a interface IDestroyable
   * -------------------------------------------------- */
  private isDestroyable(obj: unknown): obj is IDestroyable {
    return typeof (obj as IDestroyable)?.onDestroy === 'function';
  }
}
