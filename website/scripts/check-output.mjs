#!/usr/bin/env node
// Asserts that out/ still contains everything the CLI and crawlers depend on, and that
// every root-relative URL in the HTML carries NEXT_PUBLIC_BASE_PATH. Run it after
// `npm run build` and after registry/public has been copied into out/.
//   node scripts/check-output.mjs [out-dir]
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === "preview" || e.name === "previews" ? [] : htmlFiles(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

// Root-relative URLs in attributes that the browser fetches or follows.
const URL_ATTR = /\s(?:href|src|action)="(\/[^"]*)"/g;

export function checkOutput({ out, base = "", registry }) {
  const errors = [];
  const need = (rel, why) => {
    if (!existsSync(join(out, rel))) errors.push(`missing ${rel}${why ? ` (${why})` : ""}`);
  };

  need("index.html", "landing");
  need("404.html", "themed 404");
  need("sitemap.xml");
  need("robots.txt");
  need("llms.txt");
  need("index.json", "registry index, copied from registry/public");
  need("docs.html", "introduction");
  for (const p of ["installation", "theming", "cli", "components"]) need(`docs/${p}.html`);
  need("api/search", "static search index");
  need("preview/index.html", "preview runtime");

  const indexPath = registry ? join(registry, "index.json") : join(out, "index.json");
  if (existsSync(indexPath)) {
    const index = JSON.parse(readFileSync(indexPath, "utf8"));
    for (const item of index.items) need(`r/${item.name}.json`, "registry item");
    for (const item of index.items.filter((i) => i.type === "component")) {
      need(`docs/components/${item.name}.html`, "component page");
      need(`docs/components/${item.name}/llms.txt`, "component llms.txt");
      need(`md/docs/components/${item.name}.md`, "copy page text");
    }
  }

  if (existsSync(join(out, "robots.txt"))) {
    const robots = readFileSync(join(out, "robots.txt"), "utf8");
    if (!/^Sitemap: /m.test(robots)) errors.push("robots.txt has no Sitemap line");
  }
  if (existsSync(out) && readdirSync(out).some((n) => /pagefind/.test(n))) errors.push("pagefind output is still present");

  if (existsSync(out)) {
    for (const file of htmlFiles(out)) {
      const html = readFileSync(file, "utf8");
      const rel = file.slice(out.length + 1).replaceAll("\\", "/");
      for (const [, url] of html.matchAll(URL_ATTR)) {
        if (url.startsWith("//")) continue;
        if (base && url !== base && !url.startsWith(`${base}/`) && !url.startsWith(`${base}?`) && !url.startsWith(`${base}#`)) {
          errors.push(`${rel}: URL without base path ${base}: ${url}`);
          break;
        }
      }
    }
    const button = join(out, "docs/components/button.html");
    if (existsSync(button)) {
      const html = readFileSync(button, "utf8");
      if (!html.includes(`${base}/preview/index.html`)) errors.push(`docs/components/button.html does not reference ${base}/preview/index.html`);
    }
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = resolve(process.argv[2] ?? join(here, "..", "out"));
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const registry = join(here, "..", "..", "registry", "public");
  const errors = checkOutput({ out, base, registry: existsSync(registry) ? registry : undefined });
  if (errors.length) {
    console.error(`[check-output] ${errors.length} problem(s) in ${out} (base path "${base}"):\n  - ${errors.join("\n  - ")}`);
    process.exit(1);
  }
  console.log(`[check-output] ok (base path "${base}")`);
}
