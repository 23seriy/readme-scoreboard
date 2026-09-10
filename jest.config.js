/**
 * Jest configuration.
 *
 * Coverage thresholds are intentionally set slightly below the current
 * measured coverage so the suite passes today, while still failing CI if
 * coverage regresses. Raise these numbers as coverage improves.
 *
 * Baseline (v1.11.1): statements 81.53%, branches 66.46%,
 * functions 78.35%, lines 83.90%.
 */
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 65,
      functions: 77,
      lines: 83,
    },
  },
};
