import { getAllComponents, getRegistryVersion, type DocComponent } from "./docs-data";

export interface Part {
  /** Stable catalogue number, e.g. AX-014. Derived from registry order only. */
  number: string;
  slug: string;
  name: string;
  description: string;
  addCommand: string;
  component: DocComponent;
}

export function partNumber(index: number): string {
  return `AX-${String(index + 1).padStart(3, "0")}`;
}

export function addCommand(slug: string): string {
  return `npx apexrn add ${slug}`;
}

const parts: Part[] = getAllComponents().map((component, i) => ({
  number: partNumber(i),
  slug: component.slug,
  name: component.name,
  description: component.description,
  addCommand: addCommand(component.slug),
  component,
}));

export function getParts(): Part[] {
  return parts;
}

export function getPart(slug: string): Part | undefined {
  return parts.find((p) => p.slug === slug);
}

export function getPartCount(): number {
  return parts.length;
}

export function getVersion(): string {
  return getRegistryVersion();
}
