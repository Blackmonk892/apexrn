#!/usr/bin/env node
// The website is plain web; React Native, Expo and the library itself must
// not leak into its dependency graph (they break the static export).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SKIP = new Set(["node_modules", ".next", "out", "__fixtures__"]);
const SOURCE_DIRS = ["src", "scripts"];
const SOURCE_EXT = /\.(?:ts|tsx|js|mjs)$/;

const NAME =
  "(?:react-native(?:-[\\w.-]+)?|expo(?:-[\\w.-]+)?|@expo/[\\w.-]+|@react-native/[\\w.-]+|@apexrn/ui)";
const FORBIDDEN = new RegExp(`^${NAME}$`);
const SPECIFIER = `(${NAME}(?:/[^'"]*)?)`;
const IMPORT_PATTERNS = [
  new RegExp(`^\\s*(?:import|export)\\b[^;'"]*?\\bfrom\\s+['"]${SPECIFIER}['"]`, "gm"),
  new RegExp(`^\\s*import\\s+['"]${SPECIFIER}['"]`, "gm"),
  new RegExp(`\\b(?:import|require)\\(\\s*['"]${SPECIFIER}['"]`, "g"),
];

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (SOURCE_EXT.test(entry.name)) yield path;
  }
}

export function findRnUsage(websiteDir) {
  const hits = [];

  const pkgPath = join(websiteDir, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    for (const field of ["dependencies", "devDependencies"]) {
      for (const name of Object.keys(pkg[field] ?? {})) {
        if (FORBIDDEN.test(name)) hits.push({ file: "package.json", match: name });
      }
    }
  }

  for (const sub of SOURCE_DIRS) {
    const dir = join(websiteDir, sub);
    if (!existsSync(dir)) continue;
    for (const path of walk(dir)) {
      const text = readFileSync(path, "utf8");
      const file = relative(websiteDir, path).split("\\").join("/");
      for (const pattern of IMPORT_PATTERNS) {
        for (const m of text.matchAll(pattern)) hits.push({ file, match: m[1] });
      }
    }
  }

  return hits;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const hits = findRnUsage(join(dirname(fileURLToPath(import.meta.url)), ".."));
  if (hits.length === 0) {
    console.log("check-no-rn: OK");
  } else {
    for (const { file, match } of hits) {
      console.error(`check-no-rn: website/${file} references "${match}"`);
    }
    process.exit(1);
  }
}
