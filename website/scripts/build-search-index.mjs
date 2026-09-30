#!/usr/bin/env node
// Runs after `next build`: indexes the static export in out/ with Pagefind so
// the docs get a client-side search index with no backend. Safe to skip (warn,
// don't fail) if out/ doesn't exist yet, e.g. when this is run standalone.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "out");

if (!existsSync(OUT_DIR)) {
  console.warn(`[build-search-index] ${OUT_DIR} does not exist yet — run \`next build\` first. Skipping.`);
  process.exit(0);
}

execSync(`npx pagefind --site "${OUT_DIR}" --output-subdir pagefind`, {
  stdio: "inherit",
  cwd: join(__dirname, ".."),
});

console.log("[build-search-index] Pagefind index written to out/pagefind/");
