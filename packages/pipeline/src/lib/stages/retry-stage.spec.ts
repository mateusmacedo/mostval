import { RetryStage, RetryPolicy, RetryError } from './retry-stage';
import { Stage } from '../pipeline';

describe('RetryStage', () => {
  let mockInnerStage: Stage<number, number>;
  let mockExecute: jest.Mock<Promise<number>, [number]>;
  let policy: RetryPolicy;
  let retryStage: RetryStage<number, number>;
  let retryPromise: (delay: number) => Promise<void>;
  beforeEach(() => {
    mockExecute = jest.fn<Promise<number>, [number]>();

    mockInnerStage = {
      name: 'MockInnerStage',
      execute: mockExecute,
    };

    policy = {
      maxAttempts: 3,
      delay: 100,
      shouldRetry: jest.fn().mockReturnValue(true),
    };
    retryPromise = jest.fn();
    retryStage = new RetryStage<number, number>(mockInnerStage, policy, retryPromise);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('executes inner stage successfully on first attempt', async () => {
    mockExecute.mockResolvedValueOnce(42);

    const result = await retryStage.execute(10);

    expect(result).toBe(42);
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith(10);
  });

  it('retries inner stage execution on transient error and succeeds', async () => {
    mockExecute
        .mockRejectedValueOnce(new Error('Transient error'))
      .mockResolvedValueOnce(42);

    const result = await retryStage.execute(10);

    expect(result).toBe(42);
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it('respects maxAttempts and succeeds before reaching limit', async () => {
    policy.maxAttempts = 4;
    retryStage = new RetryStage<number, number>(mockInnerStage, policy, (delay) => new Promise((resolve) => setTimeout(resolve, delay)));

    mockExecute
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce(100);

    const result = await retryStage.execute(10);

    expect(result).toBe(100);
    expect(mockExecute).toHaveBeenCalledTimes(3);
  });

  it('applies delay correctly between retries', async () => {
    jest.useFakeTimers();

    mockExecute
      .mockRejectedValueOnce(new Error('Transient error'))
      .mockResolvedValueOnce(123);

    const executePromise = retryStage.execute(5);

    expect(mockExecute).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(policy.delay);
    await Promise.resolve();

    expect(mockExecute).toHaveBeenCalledTimes(1);

    const result = await executePromise;
    expect(result).toBe(123);
  });

  it('returns the output of inner stage when successful', async () => {
    mockExecute.mockResolvedValueOnce(999);
    const result = await retryStage.execute(1);
    expect(result).toBe(999);
  });

  it('does not retry if shouldRetry returns false on error', async () => {
    (policy.shouldRetry as jest.Mock).mockReturnValueOnce(false);
    mockExecute.mockRejectedValueOnce(new Error('Non-retryable error'));

    await expect(retryStage.execute(10)).rejects.toThrow('Non-retryable error');
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('retries the maximum number of attempts specified by the policy', async () => {
    policy.maxAttempts = 5;
    mockExecute.mockRejectedValue(new Error('Retry error'));

    await retryStage.execute(10).catch(() => {});

    expect(mockExecute).toHaveBeenCalledTimes(5);
  });

  it('does not retry if shouldRetry returns false on the first attempt', async () => {
    mockExecute.mockRejectedValueOnce(new Error('Some error'));
    (policy.shouldRetry as jest.Mock).mockReturnValue(false);

    await expect(retryStage.execute(10)).rejects.toThrow('Some error');
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('throws the last error after exhausting all retry attempts', async () => {
    policy.maxAttempts = 3;
    const errorToThrow = new Error('Final retry error');
    mockExecute.mockRejectedValue(errorToThrow);

    try {
      await retryStage.execute(10);
    } catch (error) {
      expect(error).toBe(errorToThrow);
      expect(mockExecute).toHaveBeenCalledTimes(policy.maxAttempts);
    }
  });

  it('respects the delay between each retry attempt', async () => {
    jest.useFakeTimers();
    policy.maxAttempts = 3;
    policy.delay = 100;
    mockExecute.mockRejectedValue(new Error('Retry error'));

    const executePromise = retryStage.execute(10);

    for (let i = 1; i < policy.maxAttempts; i++) {
      jest.advanceTimersByTime(policy.delay);
      await Promise.resolve();
    }

    try {
      await executePromise;
    } catch {
      expect(mockExecute).toHaveBeenCalledTimes(policy.maxAttempts);
    }
  });

  it('handles a zero maxAttempts gracefully', async () => {
    policy.maxAttempts = 0;
    retryStage = new RetryStage<number, number>(mockInnerStage, policy, (delay) => new Promise((resolve) => setTimeout(resolve, delay)));

    mockExecute.mockRejectedValueOnce(new Error('Immediate failure'));

    await expect(retryStage.execute(10)).rejects.toThrow('Immediate failure');
    expect(mockExecute).toHaveBeenCalledTimes(0);
  });

  it('executes successfully if the inner stage succeeds on the first attempt', async () => {
    mockExecute.mockResolvedValueOnce(1234);
    const result = await retryStage.execute(2);
    expect(result).toBe(1234);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('correctly applies increasing delay based on attempt number', async () => {
    jest.useFakeTimers();
    policy.maxAttempts = 4;
    policy.delay = 100;
    const errorToThrow = new Error('Retry error');
    mockExecute.mockRejectedValue(errorToThrow);

    const executePromise = retryStage.execute(10);

    for (let i = 1; i < policy.maxAttempts; i++) {
      const expectedDelay = policy.delay * Math.pow(2, i - 1);
      jest.advanceTimersByTime(expectedDelay);
      await Promise.resolve(); // Ensures the promise chain is processed
    }

    try {
      await executePromise;
    } catch (error) {
      expect(error).toBe(errorToThrow);
      expect(mockExecute).toHaveBeenCalledTimes(policy.maxAttempts);
    }
  });

  it('handles a very high maxAttempts value without crashing', async () => {
    policy.maxAttempts = 1000; // Arbitrary large number
    retryStage = new RetryStage<number, number>(mockInnerStage, policy, (delay) => new Promise((resolve) => setTimeout(resolve, delay)));

    mockExecute.mockResolvedValueOnce(10);

    const result = await retryStage.execute(1);
    expect(result).toBe(10);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('handles a very low delay value without issues', async () => {
    jest.useFakeTimers();
    policy.maxAttempts = 3;
    policy.delay = 1; // Very low delay
    const errorToThrow = new Error('Retry error');
    mockExecute.mockRejectedValueOnce(errorToThrow);

    const executePromise = retryStage.execute(5);

    for (let i = 1; i < policy.maxAttempts; i++) {
      jest.advanceTimersByTime(policy.delay * Math.pow(2, i - 1));
      await Promise.resolve(); // Ensures the promise chain is processed
    }

    try {
      await executePromise;
    } catch (error) {
      expect(error).toBe(errorToThrow);
      expect(mockExecute).toHaveBeenCalledTimes(policy.maxAttempts);
    }
  });

  it('does not retry on non-retryable errors as defined by shouldRetry', async () => {
    const nonRetryableError = new Error('Fatal error');
    (policy.shouldRetry as jest.Mock).mockImplementation((err: Error) => {
      return err.message !== 'Fatal error';
    });

    mockExecute.mockRejectedValueOnce(nonRetryableError);

    await expect(retryStage.execute(4)).rejects.toThrow('Fatal error');
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('handles an inner stage that always throws an error', async () => {
    const alwaysError = new Error('Always fails');
    mockExecute.mockRejectedValue(alwaysError);
    policy.maxAttempts = 3;

    try {
      await retryStage.execute(10);
    } catch (error) {
      expect(error).toBe(alwaysError);
      expect(mockExecute).toHaveBeenCalledTimes(policy.maxAttempts);
    }
  });

  it('handles an inner stage that returns undefined', async () => {
    mockExecute.mockResolvedValueOnce(undefined as any);

    const result = await retryStage.execute(100);
    expect(result).toBeUndefined();
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('throws RetryError when maxAttempts is zero', async () => {
    policy.maxAttempts = 0;
    retryStage = new RetryStage<number, number>(mockInnerStage, policy, retryPromise);

    await expect(retryStage.execute(10)).rejects.toThrow(RetryError);
    expect(mockExecute).toHaveBeenCalledTimes(0);
  });

  it('throws RetryError when a non-error is thrown', async () => {
    mockExecute.mockRejectedValueOnce('Non-error thrown');

    try {
      await retryStage.execute(10);
    } catch (error) {
      expect(error).toBeInstanceOf(RetryError);
      expect((error as RetryError).message).toBe('Non-error thrown');
    }
  });
});
