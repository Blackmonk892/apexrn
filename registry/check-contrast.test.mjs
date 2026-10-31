import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSource } from './check-contrast.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'packages', 'ui', 'lib', 'colors.ts'), 'utf8');

// Rewrites one palette block so each failure case is a single edit to the real tokens.
const editPalette = (name, edit) => {
  const start = source.indexOf(`const ${name}:`);
  const end = source.indexOf('};', start);
  const block = source.slice(start, end);
  const edited = edit(block);
  assert.notEqual(edited, block, `edit did not change ${name}`);
  return source.slice(0, start) + edited + source.slice(end);
};

test('the shipped palettes pass', () => {
  assert.deepEqual(checkSource(source), []);
});

test('a palette missing a role fails and names the palette and role', () => {
  const failures = checkSource(editPalette('rawDark', (b) => b.replace(/ {2}ring: '#[0-9A-Fa-f]{6}',\n/, '')));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /rawDark/);
  assert.match(failures[0], /ring/);
});

test('a border that matches the background fails the 3:1 rule', () => {
  const failures = checkSource(
    editPalette('neoLight', (b) => {
      const background = b.match(/ {2}background: '(#[0-9A-Fa-f]{6})'/)[1];
      return b.replace(/ {2}border: '#[0-9A-Fa-f]{6}'/, `  border: '${background}'`);
    }),
  );
  assert.equal(failures.length, 1);
  assert.match(failures[0], /neoLight/);
  assert.match(failures[0], /border/);
  assert.match(failures[0], /3:1/);
});
