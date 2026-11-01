import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import docsData from "@/generated/docs-data.json";
import dataParts from "@/generated/parts.json";
import { getCliStep } from "@/lib/cli-docs";
import { ELEVATION_ROLES, getPresetTokens, TOKEN_ROLES, type PresetKey } from "@/lib/theme-docs";
import { ComponentPreview } from "./component-preview";

function CliStep({ id }: { id: string }) {
  const step = getCliStep(id);
  return (
    <>
      <ServerCodeBlock code={step.command} lang="bash" />
      <ServerCodeBlock code={step.stdout} lang="text" codeblock={{ title: "Output" }} />
    </>
  );
}

function SetupCode() {
  return <ServerCodeBlock code={docsData.setup.code ?? ""} lang="tsx" />;
}

function PartCount() {
  return <>{dataParts.length}</>;
}

function PartRange() {
  return (
    <>
      {dataParts[0].number} to {dataParts[dataParts.length - 1].number}
    </>
  );
}

function TokenTable({ preset }: { preset: PresetKey }) {
  const { light, dark } = getPresetTokens(preset);
  const darkByName = new Map(dark.map((t) => [t.name, t.value]));
  return (
    <div className="ax-table-scroll">
      <table>
        <caption className="sr-only">{preset} colour tokens, light and dark</caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Light</th>
            <th scope="col">Dark</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody>
          {light.map((t) => (
            <tr key={t.name}>
              <th scope="row">
                <code>{t.name}</code>
              </th>
              <td>
                <span className="ax-swatch" style={{ background: t.value }} aria-hidden="true" /> <code>{t.value}</code>
              </td>
              <td>
                <span className="ax-swatch" style={{ background: darkByName.get(t.name) }} aria-hidden="true" />{" "}
                <code>{darkByName.get(t.name)}</code>
              </td>
              <td>{TOKEN_ROLES[t.name] ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ElevationTable() {
  const neo = getPresetTokens("neo");
  const raw = getPresetTokens("raw");
  return (
    <div className="ax-table-scroll">
      <table>
        <caption className="sr-only">Shadow offset in pixels per elevation, neo and raw</caption>
        <thead>
          <tr>
            <th scope="col">Elevation</th>
            <th scope="col">Neo</th>
            <th scope="col">Raw</th>
            <th scope="col">Used for</th>
          </tr>
        </thead>
        <tbody>
          {neo.elevation.map((e) => (
            <tr key={e.name}>
              <th scope="row">
                <code>{e.name}</code>
              </th>
              <td>{e.value}px</td>
              <td>{raw.elevation.find((r) => r.name === e.name)?.value}px</td>
              <td>{ELEVATION_ROLES[e.name] ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    ComponentPreview,
    CliStep,
    SetupCode,
    PartCount,
    PartRange,
    TokenTable,
    ElevationTable,
    ...components,
  } satisfies MDXComponents;
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
