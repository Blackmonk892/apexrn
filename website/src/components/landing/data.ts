import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import capture from "@/generated/cli-capture.json";
import docs from "@/generated/docs-data.json";

export interface Part {
  slug: string;
  number: string;
  name: string;
  description: string;
}

export const parts: Part[] = docs.components.map((c, i) => ({
  slug: c.slug,
  number: `AX-${String(i + 1).padStart(3, "0")}`,
  name: c.name,
  description: c.description,
}));

export const version: string = docs.registryVersion;

export function part(slug: string): Part {
  const found = parts.find((p) => p.slug === slug);
  if (!found) throw new Error(`landing: no component with slug "${slug}"`);
  return found;
}

export interface CaptureFile {
  path: string;
  written: boolean;
}

const writtenPaths = new Set(
  capture.stdout
    .split("\n")
    .map((line) => /^\s+\+\s+(\S+)/.exec(line)?.[1])
    .filter((p): p is string => Boolean(p)),
);

export const captureCommand: string = capture.command;
export const captureOutput: string = capture.stdout;
export const captureFiles: CaptureFile[] = capture.files.map((path) => ({ path, written: writtenPaths.has(path) }));

const COMPONENTS_DIR = "components/apexrn";
const LIB_DIR = "lib/apexrn";

/** The slice of the installed drawer.tsx the page shows: the CLI's own import rewrite applied to the real source. */
export function drawerExcerpt(from: number, to: number): string {
  const source = readFileSync(join(process.cwd(), "..", "packages", "ui", "components", "drawer.tsx"), "utf8").replace(/\r\n/g, "\n");
  const rel = posix.relative(COMPONENTS_DIR, LIB_DIR);
  const installed = source.replace(/(\bfrom\s+['"])\.\.\/lib\/([^'"]+)(['"])/g, `$1${rel}/$2$3`);
  return installed.split("\n").slice(from - 1, to).join("\n");
}
