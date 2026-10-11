/** Configure Jest to execute the TypeScript integration tests with coverage. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  clearMocks: true,
  collectCoverageFrom: ['src/modules/**/*.ts', 'src/middleware/**/*.ts', '!src/**/*.dto.ts'],
  coverageDirectory: 'coverage',
  coverageThreshold: { global: { statements: 70, branches: 60, functions: 70, lines: 70 } }
};
