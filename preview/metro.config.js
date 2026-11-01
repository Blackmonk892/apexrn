const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const uiRoot = path.resolve(projectRoot, '../packages/ui');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [uiRoot];

// packages/ui has no node_modules: every bare import from it resolves here,
// so the lib and preview always share ONE react / reanimated / svg.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// Aliases (extraNodeModules can't map scoped subpaths). `@/components/apexrn` and
// `@/lib/apexrn/*` are where the CLI installs the library, so example files read
// exactly as they would in a consumer's app.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@apexrn/ui') {
    return context.resolveRequest(context, path.join(uiRoot, 'index.ts'), platform);
  }
  if (moduleName === '@/components/apexrn') {
    return context.resolveRequest(context, path.join(uiRoot, 'components', 'index.ts'), platform);
  }
  if (moduleName.startsWith('@/lib/apexrn/')) {
    return context.resolveRequest(context, path.join(uiRoot, 'lib', moduleName.slice('@/lib/apexrn/'.length)), platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// If a node_modules ever reappears in the lib, Metro must never see it.
const esc = uiRoot.replace(/[\/]/g, '[\\/]');
config.resolver.blockList = [new RegExp(`${esc}[\\/]node_modules[\\/].*`)];

module.exports = config;
