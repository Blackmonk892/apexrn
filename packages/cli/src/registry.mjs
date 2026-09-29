// Reads registry JSON from an http(s) URL or a local directory (used for
// offline work and tests). The registry is untrusted input: file paths are
// validated before anything is written to disk.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_REGISTRY = 'https://blackmonk892.github.io/apexrn';

async function readJson(base, rel) {
  const isUrl = /^https?:\/\//.test(base);
  const where = isUrl
    ? `${base.replace(/\/$/, '')}/${rel}`
    : resolve(base.startsWith('file:') ? fileURLToPath(base) : base, rel);
  try {
    if (isUrl) {
      const res = await fetch(where);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }
    return JSON.parse(await readFile(where, 'utf8'));
  } catch (err) {
    throw new Error(
      `Could not read registry file ${where} (${err.message}). Check --registry or the "registry" field in apexrn.json.`,
    );
  }
}

export const getIndex = (base) => readJson(base, 'index.json');

export async function getItem(base, name) {
  const item = await readJson(base, `r/${name}.json`);
  for (const f of item.files ?? []) {
    if (!/^(components|lib)\/[a-z0-9-]+\.tsx?$/.test(f.path)) {
      throw new Error(`Registry item "${name}" has an unsafe file path "${f.path}"; refusing to write it.`);
    }
  }
  return item;
}

/** Items to install for `names`, dependencies first. */
export async function resolveClosure(base, names) {
  const index = await getIndex(base);
  const known = new Map(index.items.map((i) => [i.name, i]));
  const order = [];
  const visiting = new Set();
  const visit = (name, from) => {
    if (order.includes(name)) return;
    const entry = known.get(name);
    if (!entry) {
      const hint = [...known.keys()].filter((k) => k.includes(name) || name.includes(k)).slice(0, 3);
      throw new Error(
        `Unknown component "${name}"${from ? ` (required by ${from})` : ''}.${
          hint.length ? ` Did you mean: ${hint.join(', ')}?` : ''
        } Run \`apexrn list\`.`,
      );
    }
    if (visiting.has(name)) throw new Error(`Circular dependency involving "${name}".`);
    visiting.add(name);
    entry.registryDependencies.forEach((d) => visit(d, name));
    visiting.delete(name);
    order.push(name);
  };
  names.forEach((n) => visit(n));
  return { index, order: order.map((n) => known.get(n)) };
}
