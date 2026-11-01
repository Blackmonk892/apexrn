import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { checkOutput } from "./check-output.mjs";

const REGISTRY = { items: [{ name: "button", type: "component" }, { name: "colors", type: "lib" }] };

function build(base, mutate = () => {}) {
  const out = mkdtempSync(join(tmpdir(), "check-output-"));
  const put = (rel, body = "x") => {
    mkdirSync(dirname(join(out, rel)), { recursive: true });
    writeFileSync(join(out, rel), body);
  };
  const page = `<a href="${base}/docs">docs</a><script src="${base}/_next/a.js"></script>`;
  for (const f of ["index.html", "404.html", "docs.html", "docs/installation.html", "docs/theming.html", "docs/cli.html", "docs/components.html"]) put(f, page);
  put("docs/components/button.html", `${page}<iframe src="${base}/preview/index.html?x"></iframe>`);
  put("preview/index.html");
  put("sitemap.xml");
  put("robots.txt", "Sitemap: https://x/sitemap.xml");
  put("llms.txt");
  put("index.json", JSON.stringify(REGISTRY));
  put("r/button.json");
  put("r/colors.json");
  put("api/search");
  put("docs/components/button/llms.txt");
  put("md/docs/components/button.md");
  mutate(put, out);
  return out;
}

test("a complete output passes, with and without a base path", () => {
  for (const base of ["", "/apexrn"]) {
    const out = build(base);
    try {
      assert.deepEqual(checkOutput({ out, base }), []);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }
});

test("a missing registry file is reported", () => {
  const out = build("", (_put, dir) => rmSync(join(dir, "r/button.json")));
  try {
    assert.match(checkOutput({ out, base: "" }).join("\n"), /missing r\/button\.json/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("a URL without the base path is reported", () => {
  const out = build("/apexrn", (put) => put("404.html", '<a href="/docs">docs</a>'));
  try {
    assert.match(checkOutput({ out, base: "/apexrn" }).join("\n"), /404\.html: URL without base path/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
