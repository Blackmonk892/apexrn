#!/usr/bin/env node
// Fails if any text/background token pair in lib/colors.ts drops below WCAG AA
// (4.5:1) in either theme. Run after editing tokens, and in CI.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'ui', 'lib', 'colors.ts');
const source = readFileSync(file, 'utf8');

const PAIRS = [
  ['foreground', 'background'],
  ['primaryForeground', 'primary'],
  ['secondaryForeground', 'secondary'],
  ['accentForeground', 'accent'],
  ['destructiveForeground', 'destructive'],
  ['warningForeground', 'warning'],
  ['successForeground', 'success'],
  ['mutedForeground', 'muted'],
  ['mutedForeground', 'background'],
];

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let failed = 0;
for (const scheme of ['light', 'dark']) {
  const block = source.match(new RegExp(`\\b${scheme}: \\{([^}]*)\\}`))?.[1];
  if (!block) throw new Error(`Could not find the ${scheme} scheme in colors.ts`);
  const tokens = Object.fromEntries([...block.matchAll(/(\w+):\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => [m[1], m[2]]));
  for (const [fg, bg] of PAIRS) {
    const r = ratio(tokens[fg], tokens[bg]);
    if (r < 4.5) {
      failed++;
      console.error(`${scheme}: ${fg} on ${bg} is ${r.toFixed(2)}:1 (needs 4.5)`);
    }
  }
}
if (failed) process.exit(1);
console.log('contrast: all token pairs pass 4.5:1 in light and dark');
