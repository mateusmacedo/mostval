/* eslint-disable @typescript-eslint/no-empty-function */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BasicFactory,
  SimpleDIContainer,
  IPreCreationOption,
  IPostCreationOption,
  ILogger,
  RegistrationScope,
  IDestroyable,
} from './Instance-factory';

describe('Enhanced BasicFactory and SimpleDIContainer', () => {
  let container: SimpleDIContainer;
  let factory: BasicFactory;
  let logger: ILogger;
  const SERVICE_TOKEN = Symbol('TestService');

  class TestService implements IDestroyable {
    constructor(public value: string) {}
    onDestroy(): void {}
  }

  beforeEach(() => {
    logger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    container = new SimpleDIContainer(logger);
    factory = new BasicFactory(container, logger);
  });

  it('should create a singleton instance', () => {
    container.register(SERVICE_TOKEN, TestService, RegistrationScope.Singleton);
    const instance1 = container.resolve<TestService>(SERVICE_TOKEN);
    const instance2 = container.resolve<TestService>(SERVICE_TOKEN);
    expect(instance1).toBe(instance2);
  });

  it('should create a transient instance', () => {
    container.register(SERVICE_TOKEN, TestService, RegistrationScope.Transient);
    const instance1 = container.resolve<TestService>(SERVICE_TOKEN);
    const instance2 = container.resolve<TestService>(SERVICE_TOKEN);
    expect(instance1).not.toBe(instance2);
  });

  it('should log error if preCreate hook throws', () => {
    const preCreateToken = Symbol('PreCreateError');
    const preCreateMock: IPreCreationOption<any> = {
      preCreate: jest.fn(() => {
        throw new Error('Erro no preCreate');
      }),
    };
    container.register(preCreateToken, preCreateMock);

    expect(() =>
      factory.create(TestService, ['Test'], [preCreateToken])
    ).toThrow('Erro no preCreate');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro em preCreate'),
      expect.any(Error)
    );
  });

  it('should log error if postCreate hook throws', () => {
    const postCreateToken = Symbol('PostCreateError');
    const postCreateMock: IPostCreationOption<any> = {
      postCreate: jest.fn(() => {
        throw new Error('Erro no postCreate');
      }),
    };
    container.register(postCreateToken, postCreateMock);
    const instance = factory.create(TestService, ['Test'], [postCreateToken]);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro em postCreate'),
      expect.any(Error)
    );
  });

  it('should destroy a singleton instance properly', () => {
    const destroySpy = jest.spyOn(TestService.prototype, 'onDestroy');
    container.register(SERVICE_TOKEN, TestService, RegistrationScope.Singleton);
    container.resolve<TestService>(SERVICE_TOKEN);
    container.destroy(SERVICE_TOKEN);
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should log warning when destroying non-registered token', () => {
    const invalidToken = Symbol('InvalidToken');
    container.destroy(invalidToken);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('destroy chamado para token não registrado')
    );
  });

  it('should throw error when resolving unregistered token', () => {
    const invalidToken = Symbol('InvalidToken');
    expect(() => container.resolve(invalidToken)).toThrow(
      `Token não registrado: ${String(invalidToken)}`
    );
  });

  it('should handle instance creation failure', () => {
    const faultyTarget = jest.fn(() => {
      throw new Error('Falha na criação');
    });
    expect(() => factory.create(faultyTarget as any)).toThrow(
      'Falha na criação'
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao instanciar'),
      expect.any(Error)
    );
  });

  it('should not allow double registration of the same token', () => {
    container.register(SERVICE_TOKEN, TestService);
    expect(() => container.register(SERVICE_TOKEN, TestService)).toThrow(
      `Token já registrado: ${SERVICE_TOKEN.toString()}`
    );
  });

  it('should instantiate multiple instances using createMany', () => {
    container.register(SERVICE_TOKEN, TestService);
    const instances = factory.createMany(TestService, [['Value1'], ['Value2']]);
    expect(instances).toHaveLength(2);
    expect((instances[0] as TestService).value).toBe('Value1');
    expect((instances[1] as TestService).value).toBe('Value2');
  });

  it('should log and skip destroy if onDestroy throws', () => {
    class FaultyDestroyService implements IDestroyable {
      onDestroy(): void {
        throw new Error('Erro ao destruir');
      }
    }
    container.register(
      SERVICE_TOKEN,
      FaultyDestroyService,
      RegistrationScope.Singleton
    );
    container.resolve<FaultyDestroyService>(SERVICE_TOKEN);
    container.destroy(SERVICE_TOKEN);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao destruir'),
      expect.any(Error)
    );
  });
});
