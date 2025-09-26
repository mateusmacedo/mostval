// Global configurations for tests
// Timezone configurations for tests
process.env.TZ = 'UTC';

// Console configurations to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress specific warnings that are not relevant for Node.js libraries
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('DeprecationWarning'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('DeprecationWarning'))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };

  // Suppress logs during tests unless explicitly needed
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Global timeout configurations
jest.setTimeout(10000);

// Mock crypto for consistent UUID generation in tests
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-1234-5678-9012-345678901234'),
}));
