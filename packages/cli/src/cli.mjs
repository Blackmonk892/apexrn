import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { destFor, diffLines, rewriteImports } from './files.mjs';
import { CONFIG_FILE, defaultConfig, installedPackages, readConfig, readPackageJson, writeConfig } from './project.mjs';
import { getIndex, getItem, resolveClosure } from './registry.mjs';

const HELP = `apexrn - copy ApexRN components into your Expo app

Usage
  apexrn init [--components-dir <dir>] [--lib-dir <dir>] [--registry <url|path>]
  apexrn add <component...> [--all] [--overwrite] [--dry-run] [--no-install]
  apexrn diff <component...>
  apexrn list

Global flags
  --cwd <dir>    project root (default: current directory)
  --help, -h     show this help
  --version, -v  show the CLI version

Components are copied as source into your project; edit them freely.
Dependencies (other components, lib files) are added automatically and are
never overwritten. --overwrite only replaces the components you name.`;

const VALUE_FLAGS = new Set(['cwd', 'registry', 'components-dir', 'lib-dir']);
const ALIASES = { h: 'help', v: 'version', o: 'overwrite' };

export function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--') || /^-[a-z]$/.test(a)) {
      const key = a.startsWith('--') ? a.slice(2) : (ALIASES[a.slice(1)] ?? a.slice(1));
      if (VALUE_FLAGS.has(key)) {
        if (argv[i + 1] === undefined) throw new Error(`--${key} needs a value.`);
        flags[key] = argv[++i];
      } else flags[key] = true;
    } else positional.push(a);
  }
  return { flags, positional };
}

const log = (msg = '') => console.log(msg);

export async function main(argv) {
  const { flags, positional } = parseArgs(argv);
  const [command, ...args] = positional;

  if (flags.version) {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    return log(JSON.parse(await readFile(pkgPath, 'utf8')).version);
  }
  if (flags.help || !command) return log(HELP);

  const cwd = resolve(flags.cwd ?? process.cwd());
  switch (command) {
    case 'init':
      return init(cwd, flags);
    case 'add':
      return add(cwd, args, flags);
    case 'diff':
      return diff(cwd, args, flags);
    case 'list':
      return list(cwd, flags);
    default:
      throw new Error(`Unknown command "${command}".\n\n${HELP}`);
  }
}

async function init(cwd, flags) {
  const pkg = await readPackageJson(cwd);
  if (!installedPackages(pkg).has('expo') && !flags.force) {
    throw new Error(
      'This does not look like an Expo project (no "expo" dependency). ApexRN targets Expo; pass --force to continue anyway.',
    );
  }
  if (existsSync(join(cwd, CONFIG_FILE)) && !flags.force) {
    throw new Error(`${CONFIG_FILE} already exists. Pass --force to re-initialise.`);
  }
  const config = defaultConfig(cwd, flags);
  await writeConfig(cwd, config);
  log(`Created ${CONFIG_FILE}`);
  // `theme` pulls in colors, metrics and utils: the tokens every component reads.
  await add(cwd, ['theme'], { ...flags, registry: config.registry });

  log(`
Next steps
  1. Wrap your app root (adjust the import to your alias / relative path):

       import { GestureHandlerRootView } from 'react-native-gesture-handler';
       import { ApexRNProvider } from './${config.libDir}/theme';

       <GestureHandlerRootView style={{ flex: 1 }}>
         <ApexRNProvider defaultMode="system">{/* app */}</ApexRNProvider>
       </GestureHandlerRootView>

  2. Add components:  npx apexrn add button card dialog
     then import them together:  import { Button, Card } from './${config.componentsDir}';
  3. Restyle everything by editing ${config.libDir}/colors.ts
  4. Pass safe-area insets to AppBar / Drawer / BottomNav (useSafeAreaInsets).`);
}

async function add(cwd, names, flags) {
  const config = await readConfig(cwd, flags);
  if (flags.all) {
    names = (await getIndex(config.registry)).items.filter((i) => i.type === 'component').map((i) => i.name);
  }
  if (!names.length) throw new Error('Name at least one component, e.g. `apexrn add button`. See `apexrn list`.');

  const { order } = await resolveClosure(config.registry, names);
  const requested = new Set(names);
  const npmDeps = new Set();
  const written = [];
  const skipped = [];

  for (const entry of order) {
    entry.dependencies.forEach((d) => npmDeps.add(d));
    const item = await getItem(config.registry, entry.name);
    for (const file of item.files) {
      const dest = destFor(file.path, config);
      const abs = join(cwd, dest);
      if (existsSync(abs) && !(flags.overwrite && requested.has(item.name))) {
        skipped.push(dest);
        continue;
      }
      if (!flags['dry-run']) {
        await mkdir(dirname(abs), { recursive: true });
        await writeFile(abs, rewriteImports(file.content, file.path, config));
      }
      written.push(dest);
    }
  }

  if (!flags['dry-run']) await writeBarrel(cwd, config);
  written.forEach((f) => log(`  + ${f}`));
  skipped.forEach((f) => log(`  = ${f} (exists, kept)`));
  const hint = skipped.length && !flags.overwrite ? ' Use --overwrite to replace components you named.' : '';
  log(`${flags['dry-run'] ? 'Would write' : 'Wrote'} ${written.length} file(s), kept ${skipped.length}.${hint}`);

  const have = installedPackages(await readPackageJson(cwd));
  const missing = [...npmDeps].filter((d) => !have.has(d)).sort();
  if (!missing.length) return;
  const cmd = `npx expo install ${missing.join(' ')}`;
  if (flags['dry-run'] || flags['no-install']) return log(`\nInstall peer dependencies:\n  ${cmd}`);
  log(`\n${cmd}`);
  // `expo install` picks versions matching the project's SDK and detects the package manager.
  const res = spawnSync('npx', ['expo', 'install', ...missing], {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (res.status !== 0) throw new Error(`Peer install failed. Run it yourself:\n  ${cmd}`);
}

const BARREL_HEADER = '// Generated by apexrn: one import for every installed component. Delete this line to take ownership.';

/** Keeps `<componentsDir>/index.ts` in step with what is installed, unless the user has taken it over. */
async function writeBarrel(cwd, config) {
  const dir = join(cwd, config.componentsDir);
  if (!existsSync(dir)) return;
  const file = join(dir, 'index.ts');
  if (existsSync(file) && !(await readFile(file, 'utf8')).startsWith(BARREL_HEADER)) return;
  const names = (await readdir(dir))
    .filter((f) => /\.tsx?$/.test(f) && !/^index\./.test(f))
    .map((f) => f.replace(/\.tsx?$/, ''))
    .sort();
  await writeFile(file, [BARREL_HEADER, ...names.map((n) => `export * from './${n}';`), ''].join('\n'));
}

async function diff(cwd, names, flags) {
  const config = await readConfig(cwd, flags);
  if (!names.length) throw new Error('Name at least one component, e.g. `apexrn diff button`.');
  let changed = 0;
  for (const name of names) {
    const item = await getItem(config.registry, name);
    for (const file of item.files) {
      const dest = destFor(file.path, config);
      const abs = join(cwd, dest);
      if (!existsSync(abs)) {
        log(`${dest}: not installed`);
        continue;
      }
      const local = (await readFile(abs, 'utf8')).replace(/\r\n/g, '\n');
      const upstream = rewriteImports(file.content, file.path, config).replace(/\r\n/g, '\n');
      if (local === upstream) {
        log(`${dest}: up to date`);
        continue;
      }
      changed++;
      log(`${dest}: differs (- yours, + upstream)`);
      diffLines(local, upstream).forEach((l) => log(l));
    }
  }
  if (changed) log('\nTo take upstream: apexrn add <name> --overwrite (this replaces your edits).');
}

async function list(cwd, flags) {
  let config = { registry: flags.registry ?? defaultConfig(cwd, flags).registry, componentsDir: '', libDir: '' };
  try {
    config = await readConfig(cwd, flags);
  } catch {
    // list works before init
  }
  const { items } = await getIndex(config.registry);
  for (const type of ['component', 'theme', 'lib']) {
    const group = items.filter((i) => i.type === type);
    if (!group.length) continue;
    log(`\n${type}s`);
    for (const i of group) {
      const dest = config.componentsDir ? destFor(i.files[0], config) : '';
      const mark = dest && existsSync(join(cwd, dest)) ? '*' : ' ';
      log(` ${mark} ${i.name.padEnd(24)}${i.description}`);
    }
  }
  if (config.componentsDir) log('\n* installed');
}
