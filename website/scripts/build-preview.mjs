#!/usr/bin/env node
// Builds the preview/ Expo web runtime and copies it to public/preview, which
// the site embeds in iframes. The demo/ app is never embedded. Output is
// gitignored; set SKIP_PREVIEW_BUILD=1 to reuse an existing public/preview.
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

// The bundle is served from <site base path>/preview/, so Expo's asset URLs must start there.
// app.json is rewritten for the export only and restored afterwards.
const appJsonPath = join(previewDir, "app.json");
const originalAppJson = readFileSync(appJsonPath, "utf8");
const appJson = JSON.parse(originalAppJson);
appJson.expo.experiments = { ...appJson.expo.experiments, baseUrl: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/preview` };
writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
try {
  execSync("npx expo export --platform web", { cwd: previewDir, stdio: "inherit" });
} finally {
  writeFileSync(appJsonPath, originalAppJson);
}
rmSync(target, { recursive: true, force: true });
cpSync(dist, target, { recursive: true });
console.log("[build-preview] preview build copied to public/preview");
