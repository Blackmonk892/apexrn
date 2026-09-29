// Pure helpers: where a registry file lands in the user's project, how its
// imports are rewritten, and a small line diff.

import { posix } from 'node:path';

/** Destination (project-relative, posix) for a registry file path. */
export function destFor(registryPath, config) {
  const [dir, ...rest] = registryPath.split('/');
  return posix.join(dir === 'lib' ? config.libDir : config.componentsDir, rest.join('/'));
}

/**
 * Components import shared code as '../lib/x'. In the user's project the lib
 * folder can be anywhere, so point those imports at the configured libDir.
 * Sibling imports ('./x') stay as they are: components share one folder, and
 * so do lib files.
 */
export function rewriteImports(content, registryPath, config) {
  if (!registryPath.startsWith('components/')) return content;
  let rel = posix.relative(config.componentsDir, config.libDir);
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return content.replace(/(\bfrom\s+['"])\.\.\/lib\/([^'"]+)(['"])/g, `$1${rel}/$2$3`);
}

export function diffLines(a, b, context = 2) {
  const x = a.split('\n');
  const y = b.split('\n');
  const dp = Array.from({ length: x.length + 1 }, () => new Int32Array(y.length + 1));
  for (let i = x.length - 1; i >= 0; i--) {
    for (let j = y.length - 1; j >= 0; j--) {
      dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) {
      ops.push([' ', x[i++]]);
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push(['-', x[i++]]);
    else ops.push(['+', y[j++]]);
  }
  while (i < x.length) ops.push(['-', x[i++]]);
  while (j < y.length) ops.push(['+', y[j++]]);

  const changed = ops.map(([t]) => t !== ' ');
  const out = [];
  ops.forEach(([t, line], n) => {
    const near = changed.slice(Math.max(0, n - context), n + context + 1).some(Boolean);
    if (near) out.push(`${t} ${line}`);
    else if (out.at(-1) !== '  ...') out.push('  ...');
  });
  return out;
}
