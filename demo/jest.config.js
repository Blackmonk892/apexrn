const path = require('path');

module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@apexrn/ui$': '<rootDir>/../packages/ui/index.ts',
  },
  // packages/ui has no node_modules; its bare imports must resolve to demo's
  // single copy of react / reanimated / svg, as Metro does.
  moduleDirectories: ['node_modules', path.join(__dirname, 'node_modules')],
};
