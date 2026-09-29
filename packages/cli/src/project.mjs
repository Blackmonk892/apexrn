import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { DEFAULT_REGISTRY } from './registry.mjs';

export const CONFIG_FILE = 'apexrn.json';

export async function readPackageJson(cwd) {
  try {
    return JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8'));
  } catch {
    throw new Error(`No package.json in ${cwd}. Run this from the root of your Expo app (or pass --cwd).`);
  }
}

export function installedPackages(pkg) {
  return new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
}

export function defaultConfig(cwd, flags) {
  const base = existsSync(join(cwd, 'src')) ? 'src/' : '';
  return {
    componentsDir: flags['components-dir'] ?? `${base}components/apexrn`,
    libDir: flags['lib-dir'] ?? `${base}lib/apexrn`,
    registry: flags.registry ?? DEFAULT_REGISTRY,
  };
}

export async function readConfig(cwd, flags) {
  let config;
  try {
    config = JSON.parse(await readFile(join(cwd, CONFIG_FILE), 'utf8'));
  } catch {
    throw new Error(`No ${CONFIG_FILE} found. Run \`npx apexrn init\` first.`);
  }
  return { ...config, ...(flags.registry ? { registry: flags.registry } : {}) };
}

export const writeConfig = (cwd, config) => writeFile(join(cwd, CONFIG_FILE), JSON.stringify(config, null, 2) + '\n');
