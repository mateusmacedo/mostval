/* eslint-disable @typescript-eslint/no-explicit-any */

import { IConstructable } from './utility-type';
import { AbstractConstructor } from './utility-type';

export interface IDestroyable {
  onDestroy(): void;
}

export interface IPostCreationOption<T> {
  postCreate(instance: T): void;
}

export interface IPreCreationOption<T extends AbstractConstructor<unknown>> {
  preCreate<C extends IConstructable<T>>(args?: ConstructorParameters<C>): void;
}

export interface ILogger {
  error(message: string, error?: unknown): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

function isPreCreationOption<T extends AbstractConstructor<unknown>>(
  obj: unknown
): obj is IPreCreationOption<T> {
  return typeof (obj as IPreCreationOption<T>)?.preCreate === 'function';
}

function isPostCreationOption<T>(obj: unknown): obj is IPostCreationOption<T> {
  return typeof (obj as IPostCreationOption<T>)?.postCreate === 'function';
}

export enum RegistrationScope {
  Singleton = 'SINGLETON',
  Transient = 'TRANSIENT',
}

interface IRegistration<T extends AbstractConstructor<unknown>> {
  scope: RegistrationScope;
  provider: IConstructable<T> | InstanceType<T>;
  instance?: InstanceType<T>;
}

export interface IDIContainer {
  register<T extends AbstractConstructor<unknown>>(
    token: symbol,
    provider: IConstructable<T> | InstanceType<T>,
    scope?: RegistrationScope
  ): void;
  resolve<T>(token: symbol): T;
  destroy(token: symbol): void;
}

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

function isConstructable(
  obj: unknown
): obj is IConstructable<AbstractConstructor<unknown>> {
  return typeof obj === 'function';
}

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

    let instance: InstanceType<T>;
    try {
      instance = new target(...args);
    } catch (error) {
      this.logger.error(`Erro ao instanciar ${target.name}`, error);
      throw error;
    }

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

export class SimpleDIContainer implements IDIContainer {
  private registry = new Map<symbol, IRegistration<any>>();

  constructor(private readonly logger: ILogger) {}

  register<T extends AbstractConstructor<unknown>>(
    token: symbol,
    provider: IConstructable<T> | InstanceType<T>,
    scope: RegistrationScope = RegistrationScope.Transient
  ): void {
    if (this.registry.has(token)) {
      throw new Error(`Token já registrado: ${String(token)}`);
    }
    this.registry.set(token, { scope, provider });
  }

  resolve<T>(token: symbol): T {
    const registration = this.registry.get(token);
    if (!registration) {
      throw new Error(`Token não registrado: ${String(token)}`);
    }

    if (registration.scope === RegistrationScope.Singleton) {
      if (!registration.instance) {
        registration.instance = this.instantiate<T>(registration.provider);
      }
      return registration.instance;
    }

    return this.instantiate<T>(registration.provider);
  }

  destroy(token: symbol): void {
    const registration = this.registry.get(token);
    if (!registration) {
      this.logger.warn(
        `destroy chamado para token não registrado: ${String(token)}`
      );
      return;
    }

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

    this.registry.delete(token);
  }

  private instantiate<T>(
    provider: IConstructable<AbstractConstructor<unknown>> | T
  ): T {
    if (isConstructable(provider)) {
      return new provider() as T;
    }

    return provider;
  }

  private isDestroyable(obj: unknown): obj is IDestroyable {
    return typeof (obj as IDestroyable)?.onDestroy === 'function';
  }
}
