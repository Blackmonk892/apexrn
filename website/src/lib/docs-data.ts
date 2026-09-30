import rawData from "@/generated/docs-data.json";

export interface PropEntry {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  default: string | null;
}

export interface CompositionEntry {
  name: string;
  props: PropEntry[];
}

export interface UsageSnippet {
  heading: string;
  code: string;
  note: string;
}

export interface DocComponent {
  slug: string;
  name: string;
  description: string;
  group: string;
  dependencies: string[];
  registryDependencies: string[];
  helpers: string[];
  subComponents: string[];
  labScreen: string | null;
  labScreenIsFallback: boolean;
  usage: UsageSnippet | null;
  props: PropEntry[];
  composition: CompositionEntry[];
  variants: { prop: string; options: string[] }[];
  accessibility: string[];
}

export interface DocGroup {
  name: string;
  components: string[];
}

export interface TokenColorEntry {
  name: string;
  value: string;
}
export interface TokenScaleEntry {
  name: string;
  fn: string;
  base: number;
}
export interface TokenSimpleEntry {
  name: string;
  value: string;
}
export interface TokenData {
  light: TokenColorEntry[];
  dark: TokenColorEntry[];
  spacing: TokenScaleEntry[];
  typography: TokenScaleEntry[];
  borderWidths: TokenSimpleEntry[];
  shadowOffset: TokenSimpleEntry[];
  controlHeight: TokenSimpleEntry[];
  opacity: TokenSimpleEntry[];
  touchTarget: string | null;
}

interface DocsData {
  generatedAt: string;
  registryVersion: string;
  groups: DocGroup[];
  components: DocComponent[];
  setup: { code: string | null };
  tokens: TokenData;
}

const data = rawData as DocsData;

export function getGroups(): DocGroup[] {
  return data.groups;
}

export function getAllComponents(): DocComponent[] {
  return data.components;
}

export function getComponentBySlug(slug: string): DocComponent | undefined {
  return data.components.find((c) => c.slug === slug);
}

export function getSetupCode(): string {
  return data.setup.code ?? "";
}

/** Same-group siblings, excluding the component itself, capped to `limit`. */
export function getRelatedComponents(slug: string, limit = 4): DocComponent[] {
  const current = getComponentBySlug(slug);
  if (!current) return [];
  return data.components.filter((c) => c.group === current.group && c.slug !== slug).slice(0, limit);
}

/** Ordered flat list of every component across groups, for prev/next navigation. */
export function getFlatComponentOrder(): DocComponent[] {
  const ordered: DocComponent[] = [];
  for (const group of data.groups) {
    for (const slug of group.components) {
      const component = getComponentBySlug(slug);
      if (component) ordered.push(component);
    }
  }
  return ordered;
}

export function getAdjacentComponents(slug: string): { prev: DocComponent | null; next: DocComponent | null } {
  const order = getFlatComponentOrder();
  const idx = order.findIndex((c) => c.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return { prev: order[idx - 1] ?? null, next: order[idx + 1] ?? null };
}

export function getRegistryVersion(): string {
  return data.registryVersion;
}

export function getTokens(): TokenData {
  return data.tokens;
}
