#!/usr/bin/env node
// Writes content/docs/components/<slug>.mdx for every registry component, plus the
// section index and meta.json. Inputs: src/generated/docs-data.json (props, usage,
// accessibility), registry/public (full source), preview/src/examples (manifest and
// example sources) and CHANGELOG.md (known gaps). Output is gitignored; never edit it.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const site = join(root, "website");
const outDir = join(site, "content", "docs", "components");
const docsData = JSON.parse(readFileSync(join(site, "src", "generated", "docs-data.json"), "utf8"));
const registryIndex = JSON.parse(readFileSync(join(root, "registry", "public", "index.json"), "utf8"));
const examplesDir = join(root, "preview", "src", "examples");
const manifestPath = join(examplesDir, "manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};

const items = registryIndex.items.filter((i) => i.type === "component");
const bySlug = new Map(docsData.components.map((c) => [c.slug, c]));
const componentSlugs = new Set(items.map((i) => i.name));
const partNumber = (i) => `AX-${String(i + 1).padStart(3, "0")}`;

// The CHANGELOG's "Known gaps" bullets open with the component they describe.
const GAP_ALIASES = { FAB: "floating-action-button" };
function knownGaps() {
  const text = readFileSync(join(root, "CHANGELOG.md"), "utf8").replaceAll("\r", "");
  const section = /### Known gaps\n([\s\S]*?)(?:\n###? |\n## |$)/.exec(text)?.[1] ?? "";
  const gaps = new Map();
  for (const line of section.split("\n")) {
    const m = /^- `(\w+)`\s(.*)$/.exec(line);
    if (!m) continue;
    const slug = GAP_ALIASES[m[1]] ?? m[1].replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    if (componentSlugs.has(slug)) gaps.set(slug, line.slice(2));
  }
  return gaps;
}
const gaps = knownGaps();

// Overlays open a Modal sized to the iframe viewport, so their examples need a taller box.
const OVERLAY_SLUGS = new Set(["dialog", "alert-dialog", "sheet", "drawer", "select", "date-picker", "dropdown-menu"]);
const OVERLAY_MIN_HEIGHT = 480;
// docs/components.md snippets with known errors; the demo example is the usage for these.
const BROKEN_USAGE = new Set(["drawer", "dropdown-menu", "empty-state", "checkbox", "toast", "toaster"]);

const fence = (code, lang, meta = "") => {
  const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map((m) => m[0].length));
  const ticks = "`".repeat(longest + 1);
  return `${ticks}${lang}${meta ? ` ${meta}` : ""}\n${code.replace(/\n$/, "")}\n${ticks}`;
};
// Prose from JSDoc: pipes always break a table cell; < and { break MDX outside inline code.
const cell = (s) =>
  String(s ?? "")
    .replaceAll("\n", " ")
    .split(/(`[^`]*`)/)
    .map((part, i) => (i % 2 ? part : part.replaceAll("<", "\\<").replaceAll("{", "\\{")))
    .join("")
    .replaceAll("|", "\\|");
const code = (s) => `\`${String(s).replaceAll("\n", " ").replaceAll("|", "\\|")}\``;
const yaml = (s) => JSON.stringify(s);

function propsTable(props) {
  const rows = props.map(
    (p) => `| ${code(p.name)} | ${code(p.type)} | ${p.default ? code(p.default) : p.optional ? "—" : "required"} | ${cell(p.description) || "—"} |`,
  );
  return ["| Prop | Type | Default | Description |", "| --- | --- | --- | --- |", ...rows].join("\n");
}

function readExample(slug, id) {
  const file = join(examplesDir, slug, `${id}.tsx`);
  return existsSync(file) ? readFileSync(file, "utf8").replaceAll("\r", "") : null;
}

function preview(slug, ex, source) {
  const extra = OVERLAY_SLUGS.has(slug) ? ` minHeight={${OVERLAY_MIN_HEIGHT}}` : "";
  return `<ComponentPreview slug="${slug}" id="${ex.id}" title=${yaml(ex.title)}${extra}>\n\n${fence(source, "tsx")}\n\n</ComponentPreview>`;
}

function page(item, index) {
  const slug = item.name;
  const c = bySlug.get(slug);
  if (!c) throw new Error(`docs-data.json has no component "${slug}"`);
  const regFile = JSON.parse(readFileSync(join(root, "registry", "public", "r", `${slug}.json`), "utf8"));
  const examples = (manifest[slug] ?? []).map((ex) => ({ ex, source: readExample(slug, ex.id) })).filter((e) => e.source);
  const demo = examples.find((e) => e.ex.id === "demo");
  const rest = examples.filter((e) => e.ex.id !== "demo");

  const out = [`---`, `title: ${yaml(c.name)}`, `description: ${yaml(c.description)}`, `part: ${yaml(partNumber(index))}`, `slug: ${yaml(slug)}`, `---`, ""];
  if (demo) out.push(preview(slug, demo.ex, demo.source), "");

  out.push("## Installation", "");
  out.push(`<Tabs items={["CLI", "Manual"]}>`, `<Tab>`, "", fence(`npx apexrn add ${slug}`, "bash"), "", `</Tab>`, `<Tab>`, "");
  out.push("Copy the source below into your app. The shared files it imports come from `npx apexrn init` and the items listed under Ships with.", "");
  for (const f of regFile.files) out.push(fence(f.content.replaceAll("\r", ""), "tsx", `title=${yaml(`components/apexrn/${f.path.split("/").pop()}`)}`), "");
  const ships = (item.registryDependencies ?? []).map((d) => (componentSlugs.has(d) ? `[${code(d)}](/docs/components/${d})` : code(d)));
  out.push("#### Ships with", "", ships.length ? ships.map((s) => `- ${s}`).join("\n") : "Nothing else.", "");
  out.push("#### Peer dependencies", "");
  out.push(item.dependencies?.length ? fence(`npx expo install ${item.dependencies.join(" ")}`, "bash") : "None.", "", `</Tab>`, `</Tabs>`, "");

  out.push("## Usage", "");
  if (!c.usage && !(BROKEN_USAGE.has(slug) && demo)) out.push(fence(`import { ${[c.name, ...c.subComponents].join(", ")} } from "@/components/apexrn";`, "tsx"), "");
  if (BROKEN_USAGE.has(slug) && demo) {
    out.push(fence(demo.source, "tsx"), "");
  } else if (c.usage) {
    out.push(fence(c.usage.code, "tsx"), "");
    if (c.usage.note) out.push(c.usage.note.replace(/<code>([^<]*)<\/code>/g, "`$1`").replace(/<strong>([^<]*)<\/strong>/g, "**$1**"), "");
  }

  if (rest.length) {
    out.push("## Examples", "");
    for (const { ex, source } of rest) out.push(`### ${ex.title}`, "", preview(slug, ex, source), "");
  }

  out.push("## API reference", "");
  const tables = [];
  if (c.props.length) tables.push({ name: c.name, props: c.props });
  for (const part of c.composition) if (part.props.length) tables.push(part);
  for (const t of tables) {
    if (tables.length > 1) out.push(`### ${t.name}`, "");
    out.push(propsTable(t.props), "");
  }
  if (!tables.length) out.push("No documented props.", "");

  if (c.accessibility.length) out.push("## Accessibility", "", ...c.accessibility.map((a) => `- ${a}`), "");
  if (gaps.has(slug)) out.push("## Known limits", "", `- ${gaps.get(slug).replace(/^- /, "")}`, "");

  return out.join("\n");
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const parts = [];
items.forEach((item, i) => {
  writeFileSync(join(outDir, `${item.name}.mdx`), page(item, i));
  parts.push({ slug: item.name, number: partNumber(i), name: bySlug.get(item.name).name, description: item.description });
});

const index = [
  "---",
  'title: "Components"',
  `description: ${yaml(`${parts.length} parts. Add any of them with npx apexrn add <slug>.`)}`,
  "---",
  "",
  "| Part | Component | Description |",
  "| --- | --- | --- |",
  ...parts.map((p) => `| ${code(p.number)} | [${p.name}](/docs/components/${p.slug}) | ${cell(p.description)} |`),
  "",
].join("\n");
writeFileSync(join(outDir, "index.mdx"), index);
writeFileSync(join(outDir, "meta.json"), JSON.stringify({ title: "Components", pages: ["index", ...parts.map((p) => p.slug)] }, null, 2));
writeFileSync(join(site, "src", "generated", "parts.json"), JSON.stringify(parts, null, 2));
console.log(`[generate-component-mdx] wrote ${parts.length} pages, ${Object.keys(manifest).length} slugs with examples`);
