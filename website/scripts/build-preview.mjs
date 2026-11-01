#!/usr/bin/env node
// Builds the preview/ Expo web runtime and copies it to public/preview, which
// the site embeds in iframes. The demo/ app is never embedded. Output is
// gitignored; set SKIP_PREVIEW_BUILD=1 to reuse an existing public/preview.
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const previewDir = join(root, "..", "preview");
const dist = join(previewDir, "dist");
const target = join(root, "public", "preview");

if (process.env.SKIP_PREVIEW_BUILD === "1" && existsSync(target)) {
  console.log("[build-preview] SKIP_PREVIEW_BUILD=1, reusing public/preview");
  process.exit(0);
}

if (!existsSync(join(previewDir, "node_modules"))) {
  console.error("[build-preview] preview/node_modules is missing. Run `npm ci` in preview/ first.");
  process.exit(1);
}

execSync("npx expo export --platform web", { cwd: previewDir, stdio: "inherit" });
rmSync(target, { recursive: true, force: true });
cpSync(dist, target, { recursive: true });
console.log("[build-preview] preview build copied to public/preview");
