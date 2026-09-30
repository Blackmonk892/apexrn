import { getComponentBySlug, type DocComponent } from "./docs-data";

/**
 * Components with a live Playground specimen, and which of their real props are exposed as controls.
 *
 * This list is curated (not every prop is safely controllable — callbacks, ReactNode/style props and
 * multi-part compound components don't fit a single-instance postMessage-controlled specimen), but every
 * entry here must have a matching renderer in `demo/src/playground/registry.tsx`, and every control's
 * options/defaults are resolved against the generated registry data below — never hand-typed.
 */
type ControlSpec =
  | { prop: string; type: "select" }
  | { prop: string; type: "boolean" }
  | { prop: string; type: "range"; range: { min: number; max: number; step: number }; demoDefault: number };

interface CuratedEntry {
  controls: ControlSpec[];
  /** Fixed demo props/children rendered alongside the controlled ones — mirrors the Lab renderer exactly. */
  fixedProps?: Record<string, string>;
  children?: string;
}

const CURATED: Record<string, CuratedEntry> = {
  button: {
    controls: [
      { prop: "variant", type: "select" },
      { prop: "size", type: "select" },
      { prop: "disabled", type: "boolean" },
      { prop: "loading", type: "boolean" },
    ],
    children: "Button",
  },
  badge: {
    controls: [
      { prop: "variant", type: "select" },
      { prop: "withShadow", type: "boolean" },
    ],
    fixedProps: { label: "Badge" },
  },
  chip: {
    controls: [
      { prop: "selected", type: "boolean" },
      { prop: "disabled", type: "boolean" },
    ],
    fixedProps: { label: "Filter" },
  },
  switch: {
    controls: [
      { prop: "checked", type: "boolean" },
      { prop: "disabled", type: "boolean" },
    ],
  },
  checkbox: {
    controls: [
      { prop: "checked", type: "boolean" },
      { prop: "disabled", type: "boolean" },
    ],
  },
  progress: {
    controls: [
      // 0 is a real but visually empty default; start the demo somewhere legible instead.
      { prop: "value", type: "range", range: { min: 0, max: 100, step: 5 }, demoDefault: 60 },
      { prop: "withShadow", type: "boolean" },
    ],
  },
  avatar: {
    controls: [
      { prop: "size", type: "select" },
      { prop: "withShadow", type: "boolean" },
    ],
    fixedProps: { initials: "AR" },
  },
  alert: {
    controls: [{ prop: "variant", type: "select" }],
    fixedProps: { title: "Heads up", description: "This is a live preview." },
  },
};

export interface ResolvedControl {
  prop: string;
  label: string;
  type: "select" | "boolean" | "range";
  options?: string[];
  range?: { min: number; max: number; step: number };
  default: string | number | boolean;
}

export interface PlaygroundComponent {
  component: DocComponent;
  controls: ResolvedControl[];
  fixedProps: Record<string, string>;
  children?: string;
}

function humanize(prop: string): string {
  return prop
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function parseLiteralDefault(raw: string | null): string {
  if (!raw) return "";
  return raw.replace(/^['"]|['"]$/g, "");
}

function resolveControl(component: DocComponent, spec: ControlSpec): ResolvedControl | null {
  const propEntry = component.props.find((p) => p.name === spec.prop);
  if (!propEntry) return null; // prop renamed/removed upstream — drop the control rather than fabricate it

  if (spec.type === "select") {
    const variant = component.variants.find((v) => v.prop === spec.prop);
    if (!variant || variant.options.length === 0) return null;
    return {
      prop: spec.prop,
      label: humanize(spec.prop),
      type: "select",
      options: variant.options,
      default: parseLiteralDefault(propEntry.default) || variant.options[0],
    };
  }

  if (spec.type === "range") {
    return {
      prop: spec.prop,
      label: humanize(spec.prop),
      type: "range",
      range: spec.range,
      default: spec.demoDefault,
    };
  }

  return {
    prop: spec.prop,
    label: humanize(spec.prop),
    type: "boolean",
    default: propEntry.default === "true",
  };
}

let cache: PlaygroundComponent[] | null = null;

/** Every component with a live Playground specimen, its resolved controls, and the real doc data. */
export function getPlaygroundComponents(): PlaygroundComponent[] {
  if (cache) return cache;
  cache = Object.keys(CURATED)
    .map((slug): PlaygroundComponent | null => {
      const component = getComponentBySlug(slug);
      if (!component) return null; // registry no longer ships this component — drop silently, never 404 on stale config
      const entry = CURATED[slug];
      const controls = entry.controls
        .map((spec) => resolveControl(component, spec))
        .filter((c): c is ResolvedControl => c !== null);
      if (controls.length === 0) return null;
      return { component, controls, fixedProps: entry.fixedProps ?? {}, children: entry.children };
    })
    .filter((c): c is PlaygroundComponent => c !== null);
  return cache;
}

export function getPlaygroundComponent(slug: string): PlaygroundComponent | undefined {
  return getPlaygroundComponents().find((c) => c.component.slug === slug);
}
