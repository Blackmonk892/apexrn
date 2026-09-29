#!/usr/bin/env node
// Builds the static registry from packages/ui (the single source of truth).
// Output (registry/public, gitignored, never hand-edited):
//   index.json       – every item without file contents
//   r/<name>.json    – one item with file contents
// Dependencies are derived from real imports, so they cannot drift.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const src = join(root, 'packages', 'ui');
const out = join(here, 'public');
const meta = JSON.parse(readFileSync(join(here, 'meta.json'), 'utf8'));
const version = JSON.parse(readFileSync(join(root, 'packages', 'cli', 'package.json'), 'utf8')).version;

// Provided by every React Native / Expo app, so never listed as an install.
const BUILTIN = new Set(['react', 'react-native']);

function pkgName(spec) {
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function collect(dir, type) {
  return readdirSync(join(src, dir))
    .filter((f) => /\.tsx?$/.test(f) && f !== 'index.ts')
    .map((file) => ({ dir, file, name: file.replace(/\.tsx?$/, ''), type }));
}

const entries = [...collect('lib', 'lib'), ...collect('components', 'component')].map((e) =>
  e.dir === 'lib' && meta.themeItems.includes(e.name) ? { ...e, type: 'theme' } : e,
);

const seen = new Map();
for (const e of entries) {
  const key = `${e.dir}/${e.name}`;
  if (seen.has(e.name)) throw new Error(`Item name "${e.name}" is used by both lib and components; names must be unique.`);
  seen.set(e.name, key);
}

const errors = [];
const items = entries.map((e) => {
  const path = `${e.dir}/${e.file}`;
  // LF always: a Windows checkout (autocrlf) must build the same registry as Linux CI.
  const content = readFileSync(join(src, path), 'utf8').replace(/\r\n/g, '\n');
  const registryDependencies = new Set();
  const dependencies = new Set();

  // Only real import/export statements; a `from '...'` inside a comment or string must not count.
  const specs = [
    ...content.matchAll(/^\s*(?:import|export)\s[^;'"]*?\sfrom\s+['"]([^'"]+)['"]/gm),
    ...content.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm),
  ].map((m) => m[1]);
  for (const spec of specs) {
    if (spec.startsWith('.')) {
      // ./x (same dir) or ../lib/x / ../components/x
      const target = spec.replace(/^(\.\.?\/)+/, '').replace(/^(lib|components)\//, '');
      if (target === e.name) continue;
      if (!seen.has(target)) errors.push(`${path}: import "${spec}" does not match any registry item`);
      else registryDependencies.add(target);
    } else if (!BUILTIN.has(pkgName(spec))) {
      dependencies.add(pkgName(spec));
    }
  }

  // Peers that no import mentions (Reanimated 4 needs the worklets runtime).
  for (const d of [...dependencies]) (meta.impliedDependencies[d] ?? []).forEach((i) => dependencies.add(i));

  const description = meta.descriptions[e.name];
  if (!description) errors.push(`${path}: no description in registry/meta.json`);

  return {
    name: e.name,
    type: e.type,
    description: description ?? '',
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
    files: [{ path, content }],
  };
});

// The CLI generates `export * from './x'` barrels, so two components must never
// export the same name (TypeScript rejects the ambiguity for users).
const exportedBy = new Map();
for (const item of items.filter((i) => i.type === 'component')) {
  const src = item.files[0].content;
  const names = [
    ...[...src.matchAll(/^export\s+(?:async\s+)?(?:function|const|class|type|interface|enum)\s+(\w+)/gm)].map((m) => m[1]),
    ...[...src.matchAll(/^export\s+(?:type\s+)?\{([^}]*)\}\s*;/gm)].flatMap((m) =>
      m[1].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()).filter((n) => n && n !== 'default'),
    ),
  ];
  for (const n of new Set(names)) {
    if (exportedBy.has(n)) errors.push(`export "${n}" is exported by both ${exportedBy.get(n)} and ${item.name}`);
    else exportedBy.set(n, item.name);
  }
}

// Every dependency must be a resolvable item, and lib items must not pull in components.
for (const item of items) {
  if (item.type !== 'component') {
    const bad = item.registryDependencies.find((d) => seen.get(d).startsWith('components/'));
    if (bad) errors.push(`${item.name}: lib/theme items must not depend on component "${bad}"`);
  }
}
for (const name of Object.keys(meta.descriptions)) {
  if (!seen.has(name)) errors.push(`registry/meta.json describes "${name}" but no such source file exists`);
}

if (errors.length) {
  console.error(errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

items.sort((a, b) => a.name.localeCompare(b.name));
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'r'), { recursive: true });
for (const item of items) writeFileSync(join(out, 'r', `${item.name}.json`), JSON.stringify(item, null, 2) + '\n');
writeFileSync(
  join(out, 'index.json'),
  JSON.stringify(
    { name: 'apexrn', version, items: items.map(({ files, ...rest }) => ({ ...rest, files: files.map((f) => f.path) })) },
    null,
    2,
  ) + '\n',
);
console.log(`registry: ${items.length} items -> ${out}`);
