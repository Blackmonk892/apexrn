#!/usr/bin/env node
// Runs the repo's own CLI against the built registry in a throwaway Expo-shaped
// directory and records what it printed and wrote, so the landing page never
// shows hand-written terminal output. Peer installs are skipped with --no-install.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const cli = join(root, "packages", "cli", "bin", "apexrn.mjs");
const registry = join(root, "registry", "public");
const out = join(root, "website", "src", "generated", "cli-capture.json");
const PART = "drawer";

if (!existsSync(join(registry, "index.json"))) {
  console.log("[capture-cli] registry/public missing, building it");
  execFileSync(process.execPath, [join(root, "registry", "build.mjs")], { cwd: root, stdio: "inherit" });
}

const dir = mkdtempSync(join(tmpdir(), "apexrn-capture-"));
try {
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "capture-app", version: "1.0.0", dependencies: { expo: "~57.0.0" } }, null, 2),
  );
  const run = (args) =>
    execFileSync(process.execPath, [cli, ...args, "--cwd", dir, "--registry", registry], { encoding: "utf8" });

  run(["init", "--no-install"]);
  const stdout = run(["add", PART, "--no-install"]).trimEnd();

  const files = [];
  (function walk(d) {
    for (const name of readdirSync(d).sort()) {
      const abs = join(d, name);
      if (statSync(abs).isDirectory()) walk(abs);
      else files.push(relative(dir, abs).split("\\").join("/"));
    }
  })(dir);

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    JSON.stringify({ command: `npx apexrn add ${PART}`, stdout, files: files.filter((f) => f !== "package.json") }, null, 2),
  );
  console.log(`[capture-cli] wrote ${relative(root, out)}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
