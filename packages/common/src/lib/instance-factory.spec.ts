/* eslint-disable @typescript-eslint/no-empty-function */
import { BasicFactory, IDIContainer, ILogger } from './Instance-factory';

describe('InstanceFactory', () => {
  let instanceFactory: BasicFactory;
  let container: IDIContainer;
  let logger: ILogger;

  beforeEach(() => {
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
    const target = jest.fn(function (this: any, ...args: any[]) {
      Object.assign(this, ...args);
    }) as unknown as { new (...args: any[]): any };

    const props = [{ prop1: 'value1', prop2: 'value2' }];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    const result = instanceFactory.create(target, props);

    expect(target).toHaveBeenCalledWith(...props);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target, props, and optionTokens', () => {
    const target = jest.fn(function (this: any, ...args: any[]) {
      Object.assign(this, ...args);
    }) as unknown as { new (...args: any[]): any };

    const props = [{ prop1: 'value1', prop2: 'value2' }];
    const optionTokens = [Symbol('option1'), Symbol('option2')];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    const result = instanceFactory.create(target, props, optionTokens);

    expect(target).toHaveBeenCalledWith(...props);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[0]);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[1]);
    expect(postCreateMock).toHaveBeenCalledWith(result);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target and optionTokens', () => {
    const target = jest.fn(function (this: any, arg?: any) {
      Object.assign(this, arg);
    }) as unknown as { new (...args: any[]): any };

    const optionTokens = [Symbol('option1'), Symbol('option2')];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    const result = instanceFactory.create(target, [undefined], optionTokens);

    expect(target).toHaveBeenCalledWith(undefined);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[0]);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[1]);
    expect(postCreateMock).toHaveBeenCalledWith(result);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target only', () => {
    const target = jest.fn(function (this: any, arg?: any) {
      Object.assign(this, arg);
    }) as unknown as { new (...args: any[]): any };

    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    const result = instanceFactory.create(target, [undefined]);

    expect(target).toHaveBeenCalledWith(undefined);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target and props as undefined', () => {
    const target = jest.fn(function (this: any, arg?: any) {
      Object.assign(this, arg);
    }) as unknown as { new (...args: any[]): any };

    const props = [undefined];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    const result = instanceFactory.create(target, props);

    expect(target).toHaveBeenCalledWith(...props);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with target, props, and empty optionTokens', () => {
    const target = jest.fn(function (this: any, ...args: any[]) {
      Object.assign(this, ...args);
    }) as unknown as { new (...args: any[]): any };

    const props = [{ prop1: 'value1', prop2: 'value2' }];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    const result = instanceFactory.create(target, props, []);

    expect(target).toHaveBeenCalledWith(...props);
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with no props', () => {
    const target = jest.fn(function (this: any) {}) as unknown as {
      new (...args: any[]): any;
    };

    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    const result = instanceFactory.create(target);

    expect(target).toHaveBeenCalled();
    expect(result).toBeInstanceOf(target as any);
  });

  it('Create instance with no optionTokens', () => {
    const target = jest.fn(function (this: any, ...args: any[]) {
      Object.assign(this, ...args);
    }) as unknown as { new (...args: any[]): any };

    const props = [{ prop1: 'value1', prop2: 'value2' }];
    const postCreateMock = jest.fn();

    (container.resolve as jest.Mock).mockReturnValue({
      postCreate: postCreateMock,
    });

    const result = instanceFactory.create(target, props);

    expect(target).toHaveBeenCalledWith(...props);
    expect(result).toBeInstanceOf(target as any);
  });
});
