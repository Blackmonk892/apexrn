#!/usr/bin/env node
// Reads packages/ui/lib/colors.ts and writes every colour token for both presets
// (neo, raw) and both modes, plus each preset's elevation ladder, to
// src/generated/theme-docs.json. Nothing on /docs/theming is hand-copied.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const text = readFileSync(join(root, "packages", "ui", "lib", "colors.ts"), "utf8").replaceAll("\r", "");
const out = join(root, "website", "src", "generated", "theme-docs.json");

function scheme(constName) {
  const block = new RegExp(String.raw`const ${constName}: ColorScheme = \{([\s\S]*?)\n\};`).exec(text)?.[1];
  if (!block) throw new Error(`colors.ts: ${constName} not found`);
  return [...block.matchAll(/^\s*(\w+):\s*'(#[0-9A-Fa-f]{6})',?\s*$/gm)].map((m) => ({ name: m[1], value: m[2] }));
}

function elevation(preset) {
  const block = new RegExp(String.raw`${preset}: \{[\s\S]*?elevation: \{([^}]*)\}`).exec(text)?.[1];
  if (!block) throw new Error(`colors.ts: ${preset} elevation not found`);
  return [...block.matchAll(/(\w+):\s*(\d+)/g)].map((m) => ({ name: m[1], value: Number(m[2]) }));
}

const presets = {};
for (const p of ["neo", "raw"]) {
  presets[p] = {
    light: scheme(`${p}Light`),
    dark: scheme(`${p}Dark`),
    elevation: elevation(p),
  };
  if (!presets[p].light.length || presets[p].light.length !== presets[p].dark.length) {
    throw new Error(`colors.ts: ${p} light/dark token lists differ`);
  }
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ presets }, null, 2));
console.log("[generate-theme-docs] wrote src/generated/theme-docs.json");
