/**
 * Jest configuration.
 *
 * Coverage thresholds are intentionally set slightly below the current
 * measured coverage so the suite passes today, while still failing CI if
 * coverage regresses. Raise these numbers as coverage improves.
 *
 * Baseline (v1.11.1): statements 81.53%, branches 66.46%,
 * functions 78.35%, lines 83.90%.
 * Current (v1.16.0):  statements 92.13%, branches 71.11%,
 *                     functions 91.83%, lines 94.22%.
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
      statements: 91,
      branches: 69,
      functions: 91,
      lines: 93,
    },
  },
};
