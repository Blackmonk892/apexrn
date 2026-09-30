#!/usr/bin/env node
// Generates website/src/generated/docs-data.json from the real repo source:
//   - registry/public/index.json        (component inventory, deps, descriptions)
//   - packages/ui/components/index.ts   (authoritative export names + prop type names)
//   - packages/ui/components/*.tsx      (prop tables, via the TypeScript AST)
//   - docs/components.md                (usage snippets, verbatim)
//
// Never hand-author this data — re-run this script (wired as `predev`/`prebuild`).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const UI_COMPONENTS_DIR = join(ROOT, "packages", "ui", "components");
const UI_BARREL = join(UI_COMPONENTS_DIR, "index.ts");
const REGISTRY_INDEX = join(ROOT, "registry", "public", "index.json");
const COMPONENTS_MD = join(ROOT, "docs", "components.md");
const COLORS_FILE = join(ROOT, "packages", "ui", "lib", "colors.ts");
const DEMO_APP = join(ROOT, "demo", "App.tsx");
const OUT_DIR = join(__dirname, "..", "src", "generated");
const OUT_FILE = join(OUT_DIR, "docs-data.json");

class InventoryError extends Error {}

// Real Lab hash routes, read from demo/App.tsx's own switch statement —
// LAB_SCREEN below must never claim a route that doesn't actually exist.
function realLabScreens() {
  const text = readFileSync(DEMO_APP, "utf8");
  const caseRe = /case '([\w-]+)':/g;
  const screens = new Set();
  let m;
  while ((m = caseRe.exec(text))) screens.add(m[1]);
  return screens;
}

// ---------------------------------------------------------------------------
// The Lab (demo/App.tsx) routes specimens by a hash id that does not always
// match the registry slug 1:1 (e.g. "alert-dialog" -> "alertdialog"). This
// map mirrors the literal `case` labels in demo/App.tsx's switch statement.
// Entries with no dedicated screen fall back to the closest real specimen,
// and the component page says so explicitly (never silently mislabeled).
// ---------------------------------------------------------------------------
const LAB_SCREEN = {
  accordion: "accordion",
  alert: "alert",
  "alert-dialog": "alertdialog",
  "app-bar": "appbar",
  avatar: "avatar",
  badge: "badge",
  "bottom-nav": "bottomnav",
  "brutal-surface": { screen: "button", fallback: true },
  button: "button",
  card: "card",
  carousel: "carousel",
  checkbox: "checkbox",
  chip: "chip",
  "date-picker": "datepicker",
  dialog: "dialog",
  drawer: "drawer",
  "dropdown-menu": "dropdown",
  "floating-action-button": "fab",
  input: "input",
  "input-otp": "input_otp",
  label: "label",
  "list-item": "listitem",
  marquee: "marquee",
  progress: "progress",
  "radio-group": "radiogroup",
  "search-bar": "searchbar",
  select: "select",
  separator: "separator",
  sheet: "sheet",
  skeleton: "skeleton",
  slider: "slider",
  switch: "switch",
  tabs: "tabs",
  textarea: "textarea",
  toast: "toast",
  toaster: { screen: "toast", fallback: true },
};

const GROUP_NAMES = ["Actions", "Display", "Feedback", "Forms", "Overlays", "Navigation", "Primitive"];

function kebabify(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

// ---------------------------------------------------------------------------
// 1. Parse packages/ui/components/index.ts -> per-slug export inventory.
// ---------------------------------------------------------------------------
function parseBarrel() {
  const text = readFileSync(join(UI_COMPONENTS_DIR, "index.ts"), "utf8");
  const lineRe = /^export\s*\{([^}]*)\}\s*from\s*'\.\/([\w-]+)';?\s*$/gm;
  const bySlug = {};
  let match;
  while ((match = lineRe.exec(text))) {
    const [, body, slug] = match;
    const tokens = body.split(",").map((t) => t.trim()).filter(Boolean);
    let mainName = null;
    const propTypes = [];
    const others = [];
    for (const token of tokens) {
      if (token.startsWith("default as ")) {
        mainName = token.slice("default as ".length).trim();
      } else if (token.startsWith("type ")) {
        propTypes.push(token.slice("type ".length).trim());
      } else {
        others.push(token);
      }
    }
    if (!mainName) {
      const idx = others.findIndex((n) => kebabify(n) === slug);
      if (idx >= 0) mainName = others.splice(idx, 1)[0];
      else mainName = others[0] ?? slug;
    }
    const subComponents = others.filter((n) => /^[A-Z]/.test(n));
    const helpers = others.filter((n) => /^[a-z]/.test(n));
    bySlug[slug] = { mainName, propTypes, subComponents, helpers };
  }
  return bySlug;
}

// ---------------------------------------------------------------------------
// 2. Extract a props table for a named interface from a component's source.
// ---------------------------------------------------------------------------
function extractProps(slug, typeName) {
  const file = join(UI_COMPONENTS_DIR, `${slug}.tsx`);
  if (!existsSync(file)) return [];
  const text = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  let found = null;
  ts.forEachChild(sourceFile, (node) => {
    if (found) return;
    if (ts.isInterfaceDeclaration(node) && node.name.text === typeName) found = node;
  });
  if (!found) return [];

  return found.members
    .filter(ts.isPropertySignature)
    .map((member) => {
      const name = member.name.getText(sourceFile);
      const optional = !!member.questionToken;
      const type = member.type ? member.type.getText(sourceFile).trim() : "unknown";
      const jsDocNodes = (member).jsDoc;
      let description = "";
      let defaultValue = null;
      if (Array.isArray(jsDocNodes)) {
        for (const doc of jsDocNodes) {
          if (typeof doc.comment === "string") description = doc.comment;
          else if (Array.isArray(doc.comment)) description = doc.comment.map((c) => c.text ?? "").join("");
          for (const tag of doc.tags ?? []) {
            if (tag.tagName?.text === "default") {
              defaultValue = typeof tag.comment === "string" ? tag.comment : (tag.comment ?? []).map((c) => c.text ?? "").join("");
            }
          }
        }
      }
      return { name, type, optional, description: description.trim(), default: defaultValue };
    });
}

// ---------------------------------------------------------------------------
// 3. Parse docs/components.md into { group -> heading -> { code, note } }.
// ---------------------------------------------------------------------------
function parseComponentsMd() {
  const text = readFileSync(COMPONENTS_MD, "utf8");
  const lines = text.split("\n");
  const sections = []; // { group, heading, code, note }
  let currentGroup = null;
  let currentHeading = null;
  let collectingCode = false;
  let codeLines = [];
  let noteLines = [];
  let afterCode = false;
  let setupCode = null;
  let collectingSetup = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const groupMatch = line.match(/^## (.+)$/);
    const headingMatch = line.match(/^### (.+)$/);

    if (groupMatch) {
      currentGroup = groupMatch[1].trim();
      currentHeading = null;
      afterCode = false;
      collectingSetup = currentGroup === "Setup (once)";
      continue;
    }
    if (headingMatch && GROUP_NAMES.includes(currentGroup)) {
      currentHeading = headingMatch[1].trim();
      afterCode = false;
      continue;
    }

    if (line.trim().startsWith("```")) {
      if (!collectingCode) {
        collectingCode = true;
        codeLines = [];
      } else {
        collectingCode = false;
        afterCode = true;
        if (collectingSetup && setupCode === null) {
          setupCode = codeLines.join("\n");
        } else if (currentHeading && GROUP_NAMES.includes(currentGroup)) {
          sections.push({ group: currentGroup, heading: currentHeading, code: codeLines.join("\n"), note: "" });
        }
        noteLines = [];
      }
      continue;
    }
    if (collectingCode) {
      codeLines.push(line);
      continue;
    }
    if (afterCode && currentHeading && GROUP_NAMES.includes(currentGroup)) {
      if (line.trim() === "" && noteLines.length === 0) continue;
      if (line.startsWith("### ") || line.startsWith("## ")) continue;
      noteLines.push(line);
      const last = sections[sections.length - 1];
      if (last && last.heading === currentHeading && last.group === currentGroup) {
        last.note = noteLines.join("\n").trim();
      }
    }
  }

  return { sections, setupCode };
}

function mdInline(text) {
  // Minimal inline markdown: `code` and **bold** only — matches what components.md uses.
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

const A11Y_MARKERS = [
  { key: "accessibilityRole", label: "Sets an accessibility role" },
  { key: "accessibilityState", label: "Reports state (disabled/checked/selected/busy…) to assistive tech" },
  { key: "accessibilityLabel", label: "Provides an accessibility label" },
  { key: "accessibilityViewIsModal", label: "Marks overlay content as modal to assistive tech" },
  { key: "hitSlop", label: "Expands the hit target toward the 44/48pt minimum" },
  { key: "accessibilityLiveRegion", label: "Announces live changes" },
  { key: "importantForAccessibility", label: "Hides decorative subtrees from assistive tech" },
  { key: "BackHandler", label: "Handles the Android hardware back button" },
];

function extractAccessibility(slug) {
  const file = join(UI_COMPONENTS_DIR, `${slug}.tsx`);
  if (!existsSync(file)) return [];
  const text = readFileSync(file, "utf8");
  return A11Y_MARKERS.filter((marker) => text.includes(marker.key)).map((marker) => marker.label);
}

// A prop's type is often a local alias (`variant?: Variant`) rather than an
// inline union, so resolve `type Variant = 'a' | 'b';` declarations too.
function extractTypeAliases(slug) {
  const file = join(UI_COMPONENTS_DIR, `${slug}.tsx`);
  if (!existsSync(file)) return {};
  const text = readFileSync(file, "utf8");
  const aliasRe = /^type\s+(\w+)\s*=\s*([^;]+);/gm;
  const aliases = {};
  let m;
  while ((m = aliasRe.exec(text))) aliases[m[1]] = m[2].trim();
  return aliases;
}

// Enumerated string-literal-union props (e.g. variant, size) double as the
// "Variants" section — read straight off the extracted prop types, never hand-listed.
function extractVariants(props, aliases) {
  const literalRe = /'([^']+)'/g;
  return props
    .map((prop) => {
      const typeText = aliases[prop.type] ?? prop.type;
      const literals = [...typeText.matchAll(literalRe)].map((m) => m[1]);
      return literals.length > 1 ? { prop: prop.name, options: literals } : null;
    })
    .filter((v) => v !== null);
}

// ---------------------------------------------------------------------------
// 4. Token tables for the theming page, parsed from lib/colors.ts.
// ---------------------------------------------------------------------------
function extractTokens() {
  const text = readFileSync(COLORS_FILE, "utf8");

  function colorBlock(scheme) {
    const blockRe = new RegExp(`${scheme}:\\s*\\{([\\s\\S]*?)\\n\\s*\\},`, "m");
    const block = blockRe.exec(text)?.[1] ?? "";
    const entries = [];
    const lineRe = /^\s*(\w+):\s*'(#[0-9A-Fa-f]+)',?\s*$/gm;
    let m;
    while ((m = lineRe.exec(block))) entries.push({ name: m[1], value: m[2] });
    return entries;
  }

  function scaleBlock(exportName) {
    const blockRe = new RegExp(`export const ${exportName}[^{]*\\{([\\s\\S]*?)\\n\\};`, "m");
    const block = blockRe.exec(text)?.[1] ?? "";
    const entries = [];
    const lineRe = /get\s+'?([\w]+)'?\(\)\s*\{\s*return\s+(\w+)\((\d+)\);\s*\}/g;
    let m;
    while ((m = lineRe.exec(block))) entries.push({ name: m[1], fn: m[2], base: Number(m[3]) });
    return entries;
  }

  function simpleObject(exportName) {
    const blockRe = new RegExp(`export const ${exportName}[^{]*\\{([\\s\\S]*?)\\n\\}`, "m");
    const block = blockRe.exec(text)?.[1] ?? "";
    const entries = [];
    const lineRe = /^\s*(\w+):\s*(\{[^}]*\}|[^,\n]+),?\s*$/gm;
    let m;
    while ((m = lineRe.exec(block))) {
      const name = m[1];
      const value = m[2].trim();
      if (name === "get") continue;
      entries.push({ name, value });
    }
    return entries;
  }

  const touchTargetMatch = text.match(/export const touchTarget = (.+);/);

  return {
    light: colorBlock("light"),
    dark: colorBlock("dark"),
    spacing: scaleBlock("spacing"),
    typography: scaleBlock("typography"),
    borderWidths: simpleObject("borderWidths"),
    shadowOffset: simpleObject("shadowOffset"),
    controlHeight: simpleObject("controlHeight"),
    opacity: simpleObject("opacity"),
    touchTarget: touchTargetMatch ? touchTargetMatch[1].trim() : null,
  };
}

// ---------------------------------------------------------------------------
// AEO mirror: plain-text/markdown copies for crawlers and AI agents that
// prefer fetching text directly instead of rendering the iframe-backed page.
// Written into public/ so Next's static export copies them verbatim.
// ---------------------------------------------------------------------------
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "");
}

function escapeCell(text) {
  return String(text).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function propsToMarkdown(props) {
  if (!props.length) return "_No documented props._";
  const rows = props.map(
    (p) =>
      `| \`${escapeCell(p.name)}\` | \`${escapeCell(p.type)}\` | ${p.optional ? "no" : "yes"} | ${escapeCell(p.default ?? "—")} | ${escapeCell(p.description || "—")} |`,
  );
  return ["| Prop | Type | Required | Default | Description |", "| --- | --- | --- | --- | --- |", ...rows].join("\n");
}

function componentToLlmsTxt(component) {
  const lines = [
    `# ${component.name}`,
    "",
    component.description,
    "",
    `Group: ${component.group}`,
    `Install: npx apexrn add ${component.slug}`,
    "",
    "## Props",
    "",
    propsToMarkdown(component.props),
  ];
  if (component.composition.length) {
    lines.push("", "## Composition");
    for (const part of component.composition) {
      lines.push("", `### ${part.name}`, "", propsToMarkdown(part.props));
    }
  }
  if (component.variants.length) {
    lines.push("", "## Variants");
    for (const v of component.variants) lines.push("", `- \`${v.prop}\`: ${v.options.join(" | ")}`);
  }
  if (component.usage) {
    lines.push("", "## Usage", "", "```tsx", component.usage.code, "```");
    if (component.usage.note) lines.push("", stripHtml(component.usage.note));
  }
  if (component.accessibility.length) {
    lines.push("", "## Accessibility");
    for (const a of component.accessibility) lines.push(`- ${a}`);
  }
  return lines.join("\n") + "\n";
}

function writeLlmsTxt(components) {
  const PUBLIC_DIR = join(__dirname, "..", "public");
  const indexLines = [
    "# ApexRN",
    "",
    "Brutalist UI component library for React Native / Expo. Copy-paste components, own the code.",
    "",
    "## Components",
    "",
  ];
  for (const component of components) {
    const dir = join(PUBLIC_DIR, "docs", "components", component.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "llms.txt"), componentToLlmsTxt(component));
    indexLines.push(`- [${component.name}](/docs/components/${component.slug}) — ${component.description} (plain text: /docs/components/${component.slug}/llms.txt)`);
  }
  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(join(PUBLIC_DIR, "llms.txt"), indexLines.join("\n") + "\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
// A documented component must actually exist and ship. Any drift between the
// registry, the barrel exports and the Lab's real routes fails the build —
// it is never allowed to surface as a silently wrong or missing docs page.
function validateInventory(componentItems, barrel) {
  const errors = [];

  for (const item of componentItems) {
    const slug = item.name;
    if (!existsSync(join(UI_COMPONENTS_DIR, `${slug}.tsx`))) {
      errors.push(`registry item "${slug}" has no matching packages/ui/components/${slug}.tsx`);
      continue;
    }
    if (!barrel[slug]) {
      errors.push(`registry item "${slug}" is not exported from packages/ui/components/index.ts`);
    }
  }

  const labScreens = realLabScreens();
  for (const [slug, entry] of Object.entries(LAB_SCREEN)) {
    const screen = typeof entry === "string" ? entry : entry.screen;
    if (screen && !labScreens.has(screen)) {
      errors.push(`LAB_SCREEN["${slug}"] points at Lab route "${screen}", which has no case label in demo/App.tsx`);
    }
  }

  const registrySlugs = new Set(componentItems.map((i) => i.name));
  for (const slug of Object.keys(LAB_SCREEN)) {
    if (!registrySlugs.has(slug)) {
      errors.push(`LAB_SCREEN has an entry for "${slug}", which is not a registry component (stale mapping)`);
    }
  }

  if (errors.length) {
    throw new InventoryError(`[generate-docs] inventory does not match the real library:\n  - ${errors.join("\n  - ")}`);
  }
}

function main() {
  const registry = JSON.parse(readFileSync(REGISTRY_INDEX, "utf8"));
  const componentItems = registry.items.filter((i) => i.type === "component");
  const barrel = parseBarrel();
  validateInventory(componentItems, barrel);
  const { sections, setupCode } = parseComponentsMd();

  // Map heading -> slugs by matching comma-separated names in the heading text
  // against the barrel's main export names (the one source of truth for names).
  const nameToSlug = {};
  for (const [slug, info] of Object.entries(barrel)) nameToSlug[info.mainName] = slug;

  const headingToSlugs = {};
  for (const section of sections) {
    const key = `${section.group}::${section.heading}`;
    if (headingToSlugs[key]) continue;
    const names = section.heading
      .replace(/\s*\([^)]*\)\s*$/, "")
      .split(",")
      .map((n) => n.trim());
    const slugs = names.map((n) => nameToSlug[n]).filter(Boolean);
    if (section.heading.replace(/\s*\([^)]*\)\s*$/, "").trim() === "Toast") slugs.push("toaster");
    headingToSlugs[key] = slugs;
  }

  const slugToSection = {};
  for (const section of sections) {
    const key = `${section.group}::${section.heading}`;
    for (const slug of headingToSlugs[key] ?? []) {
      slugToSection[slug] = section;
    }
  }

  const components = componentItems.map((item) => {
    const slug = item.name;
    const info = barrel[slug] ?? { mainName: slug, propTypes: [], subComponents: [], helpers: [] };
    const section = slugToSection[slug];
    const group = section?.group ?? "Primitive";

    const rootPropTypeName = info.propTypes.find((t) => t === `${info.mainName}Props`) ?? info.propTypes[0] ?? null;
    const props = rootPropTypeName ? extractProps(slug, rootPropTypeName) : [];

    const composition = info.subComponents.map((name) => {
      const typeName = info.propTypes.find((t) => t.toLowerCase() === `${name.toLowerCase()}props`);
      return { name, props: typeName ? extractProps(slug, typeName) : [] };
    });

    const labEntry = LAB_SCREEN[slug];
    const labScreen = typeof labEntry === "string" ? labEntry : labEntry?.screen ?? null;
    const labScreenIsFallback = typeof labEntry === "object" && !!labEntry?.fallback;

    const aliases = extractTypeAliases(slug);

    return {
      slug,
      name: info.mainName,
      description: item.description,
      group,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      helpers: info.helpers,
      subComponents: info.subComponents,
      labScreen,
      labScreenIsFallback,
      usage: section ? { heading: section.heading, code: section.code, note: mdInline(section.note) } : null,
      props,
      composition,
      variants: extractVariants(props, aliases),
      accessibility: extractAccessibility(slug),
    };
  });

  components.sort((a, b) => a.name.localeCompare(b.name));

  const groups = GROUP_NAMES.map((name) => ({
    name,
    components: components.filter((c) => c.group === name).map((c) => c.slug),
  })).filter((g) => g.components.length > 0);

  const data = {
    generatedAt: new Date().toISOString(),
    registryVersion: registry.version,
    groups,
    components,
    setup: { code: setupCode },
    tokens: extractTokens(),
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));

  writeLlmsTxt(components);

  const missingUsage = components.filter((c) => !c.usage);
  const missingProps = components.filter((c) => c.props.length === 0 && c.composition.length === 0);
  const missingLabScreen = components.filter((c) => !c.labScreen);
  if (missingUsage.length || missingProps.length || missingLabScreen.length) {
    const lines = [];
    if (missingUsage.length) lines.push(`no docs/components.md snippet: ${missingUsage.map((c) => c.slug).join(", ")}`);
    if (missingProps.length) lines.push(`no extractable props/composition: ${missingProps.map((c) => c.slug).join(", ")}`);
    if (missingLabScreen.length) lines.push(`no Lab specimen route: ${missingLabScreen.map((c) => c.slug).join(", ")}`);
    throw new InventoryError(`[generate-docs] incomplete documentation source data:\n  - ${lines.join("\n  - ")}`);
  }

  console.log(`[generate-docs] wrote ${components.length} components across ${groups.length} groups to ${OUT_FILE}`);
}

main();
