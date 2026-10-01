import type { PlaygroundComponent } from "./playground-config";

export type PlaygroundValues = Record<string, string | number | boolean>;

/** Generates the JSX example shown next to the playground, from the same control data driving the live preview. */
export function generatePlaygroundCode(pc: PlaygroundComponent, values: PlaygroundValues): string {
  const { component, controls, fixedProps, children } = pc;
  const attrs: string[] = [];

  for (const [name, value] of Object.entries(fixedProps)) {
    attrs.push(`${name}="${value}"`);
  }

  for (const control of controls) {
    const value = values[control.prop] ?? control.default;
    if (control.type === "boolean") {
      if (value) attrs.push(control.prop);
      continue;
    }
    if (control.type === "range") {
      attrs.push(`${control.prop}={${value}}`);
      continue;
    }
    attrs.push(`${control.prop}="${value}"`);
  }

  const attrString = attrs.map((a) => `\n  ${a}`).join("");
  const openTag = `<${component.name}${attrString}${attrs.length ? "\n" : " "}`;
  const element = children
    ? `${openTag}>\n  ${children}\n</${component.name}>`
    : `${openTag}/>`;

  return `import { ${component.name} } from '@/components/apexrn';\n\nfunction Example() {\n  return (\n    ${element.replace(/\n/g, "\n    ")}\n  );\n}`;
}
