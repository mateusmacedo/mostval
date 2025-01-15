import { BasicFactory, IDIContainer } from './Instance-factory';

describe('InstanceFactory', () => {
  let instanceFactory: BasicFactory;
  let container: IDIContainer;

  beforeEach(() => {
    container = {
      resolve: jest.fn(),
    } as unknown as IDIContainer;
    instanceFactory = new BasicFactory(container);
  });

  it('should create an instance with the given target and props', () => {
    // Arrange
    const target = jest.fn();
    const props = { prop1: 'value1', prop2: 'value2' };
    const postCreateMock = jest.fn();
    (container.resolve as jest.Mock).mockReturnValue({ postCreate: postCreateMock });

    // Act
    const result = instanceFactory.create(target, props);

    // Assert
    expect(target).toHaveBeenCalledWith(props);
    expect(result).toBeInstanceOf(target);
  });

  it('Create instance with target, props, and optionTokens', () => {
    // Arrange
    const target = jest.fn();
    const props = { prop1: 'value1', prop2: 'value2' };
    const optionTokens = [Symbol('option1'), Symbol('option2')];
    const postCreateMock = jest.fn();
    (container.resolve as jest.Mock).mockReturnValue({ postCreate: postCreateMock });

    // Act
    const result = instanceFactory.create(target, props, optionTokens);

    // Assert
    expect(target).toHaveBeenCalledWith(props);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[0]);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[1]);
    expect(postCreateMock).toHaveBeenCalledWith(result);
    expect(result).toBeInstanceOf(target);
  });

  it('Create instance with target and optionTokens', () => {
    // Arrange
    const target = jest.fn();
    const optionTokens = [Symbol('option1'), Symbol('option2')];
    const postCreateMock = jest.fn();
    (container.resolve as jest.Mock).mockReturnValue({ postCreate: postCreateMock });

    // Act
    const result = instanceFactory.create(target, undefined, optionTokens);

    // Assert
    expect(target).toHaveBeenCalledWith(undefined);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[0]);
    expect(container.resolve).toHaveBeenCalledWith(optionTokens[1]);
    expect(postCreateMock).toHaveBeenCalledWith(result);
    expect(result).toBeInstanceOf(target);
  });

  it('Create instance with target only', () => {
    // Arrange
    const target = jest.fn();
    const postCreateMock = jest.fn();
    (container.resolve as jest.Mock).mockReturnValue({ postCreate: postCreateMock });

    // Act
    const result = instanceFactory.create(target);

    // Assert
    expect(target).toHaveBeenCalledWith(undefined);
    expect(result).toBeInstanceOf(target);
  });

  it('Create instance with target and props as undefined', () => {
    // Arrange
    const target = jest.fn();
    const postCreateMock = jest.fn();
    (container.resolve as jest.Mock).mockReturnValue({ postCreate: postCreateMock });

    // Act
    const result = instanceFactory.create(target, undefined);

    // Assert
    expect(target).toHaveBeenCalledWith(undefined);
    expect(result).toBeInstanceOf(target);
  });

  it('Create instance with target, props, and empty optionTokens', () => {
    // Arrange
    const target = jest.fn();
    const props = { prop1: 'value1', prop2: 'value2' };
    const postCreateMock = jest.fn();
    (container.resolve as jest.Mock).mockReturnValue({ postCreate: postCreateMock });

    // Act
    const result = instanceFactory.create(target, props, []);

    // Assert
    expect(target).toHaveBeenCalledWith(props);
    expect(result).toBeInstanceOf(target);
  });

  it('Create instance with no props', () => {
    // Arrange
    const target = jest.fn();
    const postCreateMock = jest.fn();
    (container.resolve as jest.Mock).mockReturnValue({ postCreate: postCreateMock });

    // Act
    const result = instanceFactory.create(target);

    // Assert
    expect(target).toHaveBeenCalledWith(undefined);
    expect(result).toBeInstanceOf(target);
  });

  it('Create instance with no optionTokens', () => {
    // Arrange
    const target = jest.fn();
    const props = { prop1: 'value1', prop2: 'value2' };
    const postCreateMock = jest.fn();
    (container.resolve as jest.Mock).mockReturnValue({ postCreate: postCreateMock });

    // Act
    const result = instanceFactory.create(target, props);

    // Assert
    expect(target).toHaveBeenCalledWith(props);
    expect(result).toBeInstanceOf(target);
  });
});
