#!/usr/bin/env node
// Shoots every example in preview/src/examples/manifest.json, light and dark, into
// public/previews/<slug>/<id>-<mode>.png. The site shows these until the live iframe
// reports ready. Needs public/preview (build-preview.mjs) and a Chrome:
// channel "chrome" first, bundled chromium as the fallback. Skip with SKIP_PREVIEW_SHOTS=1.
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.SKIP_PREVIEW_SHOTS === "1") {
  console.log("[capture-previews] SKIP_PREVIEW_SHOTS=1, skipping");
  process.exit(0);
}

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(site, "public");
const outRoot = join(publicDir, "previews");
const manifestPath = join(site, "..", "preview", "src", "examples", "manifest.json");
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const WIDTH = 720;
const MIN_HEIGHT = 320;
const PAGE_BG = { light: "#FFFFFF", dark: "#1A1A1A" };
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".ttf": "font/ttf", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

if (!existsSync(join(publicDir, "preview", "index.html"))) {
  console.error("[capture-previews] public/preview is missing. Run build-preview.mjs first.");
  process.exit(1);
}
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const jobs = Object.entries(manifest).flatMap(([slug, list]) => list.map((ex) => ({ slug, id: ex.id })));

const server = createServer((req, res) => {
  let path = decodeURIComponent((req.url ?? "/").split("?")[0]);
  if (base && path.startsWith(base)) path = path.slice(base.length);
  let file = normalize(join(publicDir, path));
  if (!file.startsWith(publicDir)) return void res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return void res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

const { chromium } = await import("playwright");
let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  console.log("[capture-previews] Chrome not found, using bundled chromium");
  browser = await chromium.launch();
}

rmSync(outRoot, { recursive: true, force: true });
let shot = 0;
const failures = [];
try {
  for (const mode of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: WIDTH, height: 900 }, reducedMotion: "reduce", colorScheme: mode });
    const page = await context.newPage();
    for (const { slug, id } of jobs) {
      const src = `${origin}${base}/preview/index.html?theme=${mode}&preset=neo#/example/${slug}/${id}`;
      try {
        await page.setContent(
          `<!doctype html><body style="margin:0;background:${PAGE_BG[mode]}"><iframe id="f" title="" style="display:block;border:0;width:${WIDTH}px;height:${MIN_HEIGHT}px" src="${src}"></iframe>
<script>window.__h=0;window.__ready=false;addEventListener("message",e=>{const d=e.data||{};if(d.type==="apexrn:ready")window.__ready=true;if(d.type==="apexrn:resize")window.__h=d.height;if(d.type==="apexrn:error")window.__err=d.message;});</script>`,
        );
        await page.waitForFunction(() => window.__ready && window.__h > 0, null, { timeout: 30000 });
        const err = await page.evaluate(() => window.__err);
        if (err) throw new Error(err);
        const height = Math.max(MIN_HEIGHT, await page.evaluate(() => window.__h));
        await page.evaluate((h) => { document.getElementById("f").style.height = `${h}px`; }, height);
        await page.waitForTimeout(400);
        const dir = join(outRoot, slug);
        mkdirSync(dir, { recursive: true });
        await page.locator("#f").screenshot({ path: join(dir, `${id}-${mode}.png`), animations: "disabled" });
        shot++;
      } catch (e) {
        failures.push(`${slug}/${id} ${mode}: ${e.message.split("\n")[0]}`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`[capture-previews] wrote ${shot} screenshots`);
if (failures.length) {
  console.error(`[capture-previews] ${failures.length} failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
