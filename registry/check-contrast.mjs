#!/usr/bin/env node
// Fails if any palette in lib/colors.ts breaks the contrast gate, or is missing
// a role. Run after editing tokens, and in CI.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PALETTES = ['neoLight', 'neoDark', 'rawLight', 'rawDark'];

const ROLES = [
  'background', 'foreground', 'surface', 'surfaceForeground', 'muted', 'mutedForeground',
  'primary', 'primaryForeground', 'secondary', 'secondaryForeground', 'accent', 'accentForeground',
  'destructive', 'destructiveForeground', 'success', 'successForeground', 'warning', 'warningForeground',
  'border', 'input', 'ring', 'shadow', 'scrim',
];

// [foreground role, background role, minimum ratio]. Text needs 4.5:1; border and
// ring are non-text UI (WCAG 1.4.11, 3:1). The shadow is decorative because the
// border already draws the edge, so it only has to read as a distinct plane.
const TEXT = 4.5;
const PAIRS = [
  ['foreground', 'background', TEXT],
  ['surfaceForeground', 'surface', TEXT],
  ['mutedForeground', 'muted', TEXT],
  ['mutedForeground', 'background', TEXT],
  ['primaryForeground', 'primary', TEXT],
  ['secondaryForeground', 'secondary', TEXT],
  ['accentForeground', 'accent', TEXT],
  ['destructiveForeground', 'destructive', TEXT],
  ['successForeground', 'success', TEXT],
  ['warningForeground', 'warning', TEXT],
  ['border', 'background', 3],
  ['ring', 'background', 3],
  ['shadow', 'background', 1.5],
];

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export function checkSource(source) {
  const failures = [];
  for (const name of PALETTES) {
    const block = source.match(new RegExp(`const ${name}\\b[^=]*=\\s*\\{([^}]*)\\}`))?.[1];
    if (!block) {
      failures.push(`${name}: palette not found in colors.ts`);
      continue;
    }
    const tokens = Object.fromEntries([...block.matchAll(/(\w+):\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => [m[1], m[2]]));
    const missing = ROLES.filter((role) => !tokens[role]);
    for (const role of missing) failures.push(`${name}: missing role ${role}`);
    for (const [fg, bg, min] of PAIRS) {
      if (!tokens[fg] || !tokens[bg]) continue;
      const r = ratio(tokens[fg], tokens[bg]);
      if (r < min) failures.push(`${name}: ${fg} on ${bg} is ${r.toFixed(2)}:1 (needs ${min}:1)`);
    }
  }
  return failures;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'ui', 'lib', 'colors.ts');
  const failures = checkSource(readFileSync(file, 'utf8'));
  for (const line of failures) console.error(line);
  if (failures.length) process.exit(1);
  console.log('contrast: all palettes pass (text 4.5:1, border and ring 3:1, shadow 1.5:1)');
}
