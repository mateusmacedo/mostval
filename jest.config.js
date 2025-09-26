const { getJestProjectsAsync } = require('@nx/jest');

module.exports = async () => ({
  projects: await getJestProjectsAsync(),
  // Global configurations for all projects
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    '!**/jest.config.{js,ts}',
    '!**/jest.preset.{js,ts}',
    '!**/jest.setup.{js,ts}',
    '!**/index.{ts,js}',
    '!**/__tests__/**',
    '!**/tests/**',
    '!**/test/**',
    '!**/*.spec.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Performance configurations
  maxWorkers: '50%',
  // Environment configurations
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // TypeScript configuration for Jest
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      tsconfig: '<rootDir>/jest.tsconfig.json',
      useESM: false,
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  // Transform ignore patterns for ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(pino|@elastic/ecs-pino-format)/)',
  ],
});
