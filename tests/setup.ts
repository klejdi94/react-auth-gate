/**
 * Test setup file
 * Runs before all tests
 */

// Add any global test setup here
// For example, you might want to add custom matchers or configure the test environment

// Mock performance.now if not available
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  } as any;
}

// Suppress console errors during tests (optional)
// global.console.error = jest.fn();
