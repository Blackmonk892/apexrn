import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { diffLines, rewriteImports } from '../src/files.mjs';
import { parseArgs } from '../src/cli.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const bin = join(here, '..', 'bin', 'apexrn.mjs');
const registry = resolve(here, '..', '..', '..', 'registry', 'public');
const tmp = [];

function apexrn(cwd, ...args) {
  const r = spawnSync(process.execPath, [bin, ...args, '--cwd', cwd, '--registry', registry, '--no-install'], {
    encoding: 'utf8',
  });
  return { code: r.status, out: r.stdout + r.stderr };
}

function project({ src = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'apexrn-'));
  tmp.push(dir);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', dependencies: { expo: '^57.0.0', react: '19' } }));
  if (src) mkdirSync(join(dir, 'src'));
  return dir;
}

before(() => {
  const r = spawnSync(process.execPath, [join(here, '..', '..', '..', 'registry', 'build.mjs')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
});
after(() => tmp.forEach((d) => rmSync(d, { recursive: true, force: true })));

describe('pure helpers', () => {
  const config = { componentsDir: 'src/components/apexrn', libDir: 'src/lib/apexrn' };

  test('rewriteImports points ../lib at the configured lib dir', () => {
    const out = rewriteImports("import { useTheme } from '../lib/theme';\nimport B from './brutal-surface';", 'components/x.tsx', config);
    assert.match(out, /from '\.\.\/\.\.\/lib\/apexrn\/theme'/);
    assert.match(out, /from '\.\/brutal-surface'/);
  });

  test('rewriteImports handles a lib dir nested inside the components dir', () => {
    const out = rewriteImports("import a from '../lib/colors';", 'components/x.tsx', {
      componentsDir: 'ui',
      libDir: 'ui/lib',
    });
    assert.match(out, /from '\.\/lib\/colors'/);
  });

  test('rewriteImports leaves lib files untouched', () => {
    const src = "import { x } from './colors';";
    assert.equal(rewriteImports(src, 'lib/theme.tsx', config), src);
  });

  test('diffLines marks changes and collapses unchanged runs', () => {
    const a = Array.from({ length: 20 }, (_, i) => `l${i}`).join('\n');
    const b = a.replace('l10', 'CHANGED');
    const d = diffLines(a, b);
    assert.ok(d.includes('- l10') && d.includes('+ CHANGED'));
    assert.ok(d.includes('  ...'));
  });

  test('parseArgs reads value flags and aliases', () => {
    const { flags, positional } = parseArgs(['add', 'button', '-o', '--lib-dir', 'x']);
    assert.deepEqual(positional, ['add', 'button']);
    assert.equal(flags.overwrite, true);
    assert.equal(flags['lib-dir'], 'x');
    assert.throws(() => parseArgs(['--registry']), /needs a value/);
  });
});

describe('cli', () => {
  test('init writes config and the theme closure', () => {
    const dir = project();
    const r = apexrn(dir, 'init');
    assert.equal(r.code, 0, r.out);
    const cfg = JSON.parse(readFileSync(join(dir, 'apexrn.json'), 'utf8'));
    assert.equal(cfg.componentsDir, 'src/components/apexrn');
    for (const f of ['theme.tsx', 'colors.ts', 'metrics.ts']) assert.ok(existsSync(join(dir, 'src/lib/apexrn', f)), f);
    assert.match(r.out, /ApexRNProvider/);
  });

  test('init uses root-level dirs when there is no src/', () => {
    const dir = project({ src: false });
    assert.equal(apexrn(dir, 'init').code, 0);
    assert.ok(existsSync(join(dir, 'lib/apexrn/theme.tsx')));
  });

  test('init refuses a non-Expo project and a second run', () => {
    const bare = mkdtempSync(join(tmpdir(), 'apexrn-'));
    tmp.push(bare);
    writeFileSync(join(bare, 'package.json'), '{"dependencies":{}}');
    assert.match(apexrn(bare, 'init').out, /Expo/);
    const dir = project();
    apexrn(dir, 'init');
    assert.match(apexrn(dir, 'init').out, /already exists/);
  });

  test('add copies a component with its whole dependency closure and rewrites imports', () => {
    const dir = project();
    apexrn(dir, 'init');
    const r = apexrn(dir, 'add', 'search-bar');
    assert.equal(r.code, 0, r.out);
    const c = join(dir, 'src/components/apexrn');
    for (const f of ['search-bar.tsx', 'input.tsx', 'brutal-surface.tsx']) assert.ok(existsSync(join(c, f)), f);
    assert.ok(existsSync(join(dir, 'src/lib/apexrn/icons.tsx')));
    assert.ok(existsSync(join(dir, 'src/lib/apexrn/use-press-physics.ts')));
    assert.match(readFileSync(join(c, 'search-bar.tsx'), 'utf8'), /from '\.\.\/\.\.\/lib\/apexrn\/icons'/);
    assert.match(r.out, /expo install .*react-native-reanimated.*react-native-svg.*react-native-worklets|expo install .*expo-haptics/);
  });

  test('add maintains a barrel so one import reaches every installed component', () => {
    const dir = project();
    apexrn(dir, 'init');
    apexrn(dir, 'add', 'card');
    const barrel = join(dir, 'src/components/apexrn/index.ts');
    const body = readFileSync(barrel, 'utf8');
    assert.match(body, /export \* from '\.\/card';/);
    assert.match(body, /export \* from '\.\/brutal-surface';/);
    assert.ok(!body.includes("'./index'"));
    apexrn(dir, 'add', 'badge');
    assert.match(readFileSync(barrel, 'utf8'), /export \* from '\.\/badge';/);
    const mine = '// mine\nexport * from "./card";\n';
    writeFileSync(barrel, mine);
    apexrn(dir, 'add', 'label');
    assert.equal(readFileSync(barrel, 'utf8'), mine, 'user-owned barrel is left alone');
  });

  test('add never clobbers edits to a dependency; --overwrite only touches named components', () => {
    const dir = project();
    apexrn(dir, 'init');
    apexrn(dir, 'add', 'card');
    const colors = join(dir, 'src/lib/apexrn/colors.ts');
    const surface = join(dir, 'src/components/apexrn/brutal-surface.tsx');
    const card = join(dir, 'src/components/apexrn/card.tsx');
    writeFileSync(colors, '// mine\n');
    writeFileSync(surface, '// mine\n');
    writeFileSync(card, '// mine\n');

    apexrn(dir, 'add', 'card');
    assert.equal(readFileSync(card, 'utf8'), '// mine\n', 'no --overwrite keeps edits');

    const r = apexrn(dir, 'add', 'card', '--overwrite');
    assert.equal(r.code, 0, r.out);
    assert.notEqual(readFileSync(card, 'utf8'), '// mine\n');
    assert.equal(readFileSync(colors, 'utf8'), '// mine\n', 'tokens stay');
    assert.equal(readFileSync(surface, 'utf8'), '// mine\n', 'dependencies stay');
  });

  test('add --dry-run writes nothing', () => {
    const dir = project();
    apexrn(dir, 'init');
    const r = apexrn(dir, 'add', 'button', '--dry-run');
    assert.equal(r.code, 0, r.out);
    assert.ok(!existsSync(join(dir, 'src/components/apexrn/button.tsx')));
    assert.match(r.out, /Would write/);
  });

  test('add rejects unknown names with a suggestion', () => {
    const dir = project();
    apexrn(dir, 'init');
    const r = apexrn(dir, 'add', 'buton');
    assert.notEqual(r.code, 0);
    assert.match(r.out, /Unknown component "buton"/);
    assert.match(apexrn(dir, 'add', 'search').out, /search-bar/);
  });

  test('add before init explains what to do', () => {
    assert.match(apexrn(project(), 'add', 'button').out, /apexrn init/);
  });

  test('diff reports up to date, then differs after an edit', () => {
    const dir = project();
    apexrn(dir, 'init');
    apexrn(dir, 'add', 'badge');
    assert.match(apexrn(dir, 'diff', 'badge').out, /up to date/);
    const f = join(dir, 'src/components/apexrn/badge.tsx');
    writeFileSync(f, readFileSync(f, 'utf8') + '\n// local tweak\n');
    const r = apexrn(dir, 'diff', 'badge');
    assert.match(r.out, /differs/);
    assert.match(r.out, /- \/\/ local tweak/);
  });

  test('custom directories are honoured', () => {
    const dir = project();
    assert.equal(apexrn(dir, 'init', '--components-dir', 'ui/kit', '--lib-dir', 'ui/core').code, 0);
    apexrn(dir, 'add', 'label');
    assert.match(readFileSync(join(dir, 'ui/kit/label.tsx'), 'utf8'), /from '\.\.\/core\/theme'/);
  });

  test('list works before init and marks installed items after', () => {
    const dir = project();
    assert.match(apexrn(dir, 'list').out, /button\s+Pressable button/);
    apexrn(dir, 'init');
    apexrn(dir, 'add', 'button');
    assert.match(apexrn(dir, 'list').out, /\* button/);
  });

  test('a registry with a path-traversal file is refused', () => {
    const bad = mkdtempSync(join(tmpdir(), 'apexrn-reg-'));
    tmp.push(bad);
    mkdirSync(join(bad, 'r'));
    const entry = { name: 'evil', type: 'component', description: '', dependencies: [], registryDependencies: [] };
    writeFileSync(join(bad, 'index.json'), JSON.stringify({ items: [{ ...entry, files: ['components/../../x.ts'] }] }));
    writeFileSync(join(bad, 'r/evil.json'), JSON.stringify({ ...entry, files: [{ path: 'components/../../x.ts', content: 'x' }] }));
    const dir = project();
    apexrn(dir, 'init');
    const r = spawnSync(process.execPath, [bin, 'add', 'evil', '--cwd', dir, '--registry', bad, '--no-install'], { encoding: 'utf8' });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /unsafe file path/);
    assert.ok(!existsSync(join(dir, 'src/x.ts')) && !existsSync(join(dir, 'x.ts')));
  });
});
