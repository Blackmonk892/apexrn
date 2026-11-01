#!/usr/bin/env node
// Runs every documented CLI command against the built registry in a throwaway
// Expo-shaped directory and records the exact output, so /docs/cli never shows
// hand-written terminal text. Peer installs are skipped with --no-install.
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const cli = join(root, "packages", "cli", "bin", "apexrn.mjs");
const registry = join(root, "registry", "public");
const out = join(root, "website", "src", "generated", "cli-docs.json");
const PART = "button";

if (!existsSync(join(registry, "index.json"))) {
  console.log("[capture-cli-docs] registry/public missing, building it");
  execFileSync(process.execPath, [join(root, "registry", "build.mjs")], { cwd: root, stdio: "inherit" });
}

const dir = mkdtempSync(join(tmpdir(), "apexrn-cli-docs-"));
try {
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "docs-app", version: "1.0.0", dependencies: { expo: "~57.0.0" } }, null, 2),
  );
  const steps = [];
  function run(display, args, note) {
    const stdout = execFileSync(process.execPath, [cli, ...args, "--cwd", dir, "--registry", registry], {
      encoding: "utf8",
    }).trimEnd();
    steps.push({ id: args[0] + (args.includes("--overwrite") ? "-overwrite" : steps.some((s) => s.id === args[0]) ? "-again" : ""), command: display, note, stdout });
  }

  run("npx apexrn init", ["init", "--no-install"], "");
  run(`npx apexrn add ${PART}`, ["add", PART, "--no-install"], "");
  run(`npx apexrn add ${PART}`, ["add", PART, "--no-install"], "Second run: nothing is overwritten.");
  run(`npx apexrn add ${PART} --overwrite`, ["add", PART, "--overwrite", "--no-install"], "");
  run(`npx apexrn diff ${PART}`, ["diff", PART], "No local edits yet.");
  // A real edit, so the diff output is a real diff.
  appendFileSync(join(dir, "components", "apexrn", `${PART}.tsx`), "\n// local tweak\n");
  run(`npx apexrn diff ${PART}`, ["diff", PART], "After adding a comment line to button.tsx.");
  run("npx apexrn list", ["list"], "");

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify({ steps }, null, 2));
  console.log(`[capture-cli-docs] wrote ${relative(root, out)}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
