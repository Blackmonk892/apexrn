import type { DocComponent } from "./docs-data";

export type Control =
  | { kind: "select"; name: string; options: string[]; initial: string }
  | { kind: "toggle"; name: string; initial: boolean };

const unquote = (s: string) => s.replace(/^['"]|['"]$/g, "");

/** Options of an inline string-literal union such as `'left' | 'right'`, else null. */
function literalUnion(type: string): string[] | null {
  const parts = type.split("|").map((s) => s.trim());
  if (parts.length < 2 || !parts.every((p) => /^'[^']*'$|^"[^"]*"$/.test(p))) return null;
  return parts.map(unquote);
}

/** Preview controls come from the documented props, never a hand-kept list. */
export function getControls(component: DocComponent): Control[] {
  const controls: Control[] = [];
  const seen = new Set<string>();
  const propByName = new Map(component.props.map((p) => [p.name, p]));

  const addSelect = (name: string, options: string[]) => {
    if (seen.has(name) || options.length < 2) return;
    seen.add(name);
    const def = propByName.get(name)?.default;
    const initial = def && options.includes(unquote(def)) ? unquote(def) : options[0];
    controls.push({ kind: "select", name, options, initial });
  };

  for (const v of component.variants) addSelect(v.prop, v.options);
  for (const p of component.props) {
    const options = literalUnion(p.type);
    if (options) addSelect(p.name, options);
  }
  for (const p of component.props) {
    if (p.type === "boolean" && !seen.has(p.name)) {
      seen.add(p.name);
      controls.push({ kind: "toggle", name: p.name, initial: p.default === "true" });
    }
  }
  return controls;
}

/** Fixed props that make a part visible in the preview: its own name as label text. */
export function baseProps(component: DocComponent): Record<string, unknown> {
  const has = (n: string) => component.props.some((p) => p.name === n);
  if (has("children")) return { children: component.name };
  if (has("title")) return { title: component.name };
  if (has("label")) return { label: component.name };
  return {};
}
