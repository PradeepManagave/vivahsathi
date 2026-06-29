/**
 * Jest setup file - runs after test framework is loaded
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Suppress console output during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

if (process.env.VERBOSE_TESTS !== 'true') {
  console.log = jest.fn();
  console.warn = jest.fn();
  // Keep console.error for actual test failures
  console.error = originalConsoleError;
}

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Restore console on exit
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
