import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSource } from './check-contrast.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(here, ...parts), 'utf8');

test('the shipped palettes pass', () => {
  assert.deepEqual(checkSource(read('..', 'packages', 'ui', 'lib', 'colors.ts')), []);
});

test('a palette missing a role fails and names the palette and role', () => {
  const failures = checkSource(read('__fixtures__', 'missing-ring.ts'));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /rawDark/);
  assert.match(failures[0], /ring/);
});

test('a border that matches the background fails the 3:1 rule', () => {
  const failures = checkSource(read('__fixtures__', 'invisible-border.ts'));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /neoLight/);
  assert.match(failures[0], /border/);
  assert.match(failures[0], /3:1/);
});
