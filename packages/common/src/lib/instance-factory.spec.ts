import { BasicFactory, IDIContainer, ILogger } from './Instance-factory';

describe('InstanceFactory', () => {
  let instanceFactory: BasicFactory;
  let container: IDIContainer;
  let logger: ILogger;

  beforeEach(() => {
    // Simulação (mock) de IDIContainer com Jest
    container = {
      resolve: jest.fn(),
    } as unknown as IDIContainer;

    logger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    } as unknown as ILogger;

    instanceFactory = new BasicFactory(container, logger);
  });

  it('should create an instance with the given target and props', () => {
    // Arrange
    // Mock que simula um construtor. Com TS, precisamos enganar o compilador:
    const target = jest.fn(function (this: any, ...args: any[]) {
      // Podemos armazenar as props passadas ou simular algum comportamento
      Object.assign(this, ...args);
    }) as unknown as { new (...args: any[]): any };

    const props = [{ prop1: 'value1', prop2: 'value2' }];
    const postCreateMock = jest.fn();

    // Container retorna um objeto que tem postCreate
    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    // Act
    const result = instanceFactory.create(target, props);

    // Assert
    // Verifica se o construtor foi chamado com os parâmetros
    expect(target).toHaveBeenCalledWith(...props);
    // Verifica se a instância resultante é de fato criada via 'target'
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target, props, and optionTokens', () => {
    // Arrange
    const target = jest.fn(function (this: any, ...args: any[]) {
      Object.assign(this, ...args);
    }) as unknown as {
      new (...args: any[]): any;
    };
    const props = [{ prop1: 'value1', prop2: 'value2' }];
    const optionTokens = [Symbol('option1'), Symbol('option2')];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    // Act
    const result = instanceFactory.create(target, props, optionTokens);

    // Assert
    expect(target).toHaveBeenCalledWith(...props);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[0]);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[1]);
    expect(postCreateMock).toHaveBeenCalledWith(result);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target and optionTokens', () => {
    // Arrange
    const target = jest.fn(function (this: any, arg?: any) {
      Object.assign(this, arg);
    }) as unknown as {
      new (...args: any[]): any;
    };
    const optionTokens = [Symbol('option1'), Symbol('option2')];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    // Act
    const result = instanceFactory.create(target, [undefined], optionTokens);

    // Assert
    expect(target).toHaveBeenCalledWith(undefined);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[0]);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[1]);
    expect(postCreateMock).toHaveBeenCalledWith(result);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target only', () => {
    // Arrange
    const target = jest.fn(function (this: any, arg?: any) {
      Object.assign(this, arg);
    }) as unknown as {
      new (...args: any[]): any;
    };
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    // Act
    const result = instanceFactory.create(target, [undefined]);

    // Assert
    expect(target).toHaveBeenCalledWith(undefined);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target and props as undefined', () => {
    // Arrange
    const target = jest.fn(function (this: any, arg?: any) {
      Object.assign(this, arg);
    }) as unknown as {
      new (...args: any[]): any;
    };
    const props = [undefined];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    // Act
    const result = instanceFactory.create(target, props);

    // Assert
    expect(target).toHaveBeenCalledWith(...props);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target, props, and empty optionTokens', () => {
    // Arrange
    const target = jest.fn(function (this: any, ...args: any[]) {
      Object.assign(this, ...args);
    }) as unknown as {
      new (...args: any[]): any;
    };
    const props = [{ prop1: 'value1', prop2: 'value2' }];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    // Act
    const result = instanceFactory.create(target, props, []);

    // Assert
    expect(target).toHaveBeenCalledWith(...props);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with no props', () => {
    // Arrange
    const target = jest.fn(function (this: any) {
      /* função intencionalmente vazia */
    }) as unknown as {
      new (...args: any[]): any;
    };
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    // Act
    const result = instanceFactory.create(target);

    // Assert
    expect(target).toHaveBeenCalled();
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with no optionTokens', () => {
    // Arrange
    const target = jest.fn(function (this: any, ...args: any[]) {
      Object.assign(this, ...args);
    }) as unknown as {
      new (...args: any[]): any;
    };
    const props = [{ prop1: 'value1', prop2: 'value2' }];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    // Act
    const result = instanceFactory.create(target, props);

    // Assert
    expect(target).toHaveBeenCalledWith(...props);
    expect(result).toBeInstanceOf(target as any);
  });
});
