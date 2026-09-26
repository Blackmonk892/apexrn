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

module.exports = config;