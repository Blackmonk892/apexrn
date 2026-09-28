const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Find the directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 2. Watch all files in the entire workspace (which includes packages/ui)
config.watchFolders = [workspaceRoot];

// 3. Force Metro to resolve dependencies accurately
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 4. Resolve `@ui` at the Metro level too (not just via babel), so bundles
// don't depend on babel cache state to find the workspace package.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@ui': path.resolve(workspaceRoot, 'packages/ui'),
};

module.exports = config;