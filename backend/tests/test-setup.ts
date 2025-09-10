// Global test setup - must be imported before any other modules
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';

// Mock console methods to reduce test output noise
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
