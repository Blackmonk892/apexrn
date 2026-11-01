import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { ELEVATION_ROLES, getPresetTokens, TOKEN_ROLES, type PresetKey, type ThemeToken } from "@/lib/theme-docs";

export const metadata: Metadata = {
  title: "Theming",
  description: "Every ApexRN colour token for the neo and raw presets in light and dark, and the elevation ladder that sets shadow depth.",
};

const PRESETS: { key: PresetKey; title: string; blurb: string }[] = [
  { key: "neo", title: "Neo", blurb: "Saturated fills, hard shadows that step up with depth." },
  { key: "raw", title: "Raw", blurb: "Ink on paper with one red signal colour. Every raised surface sits the same 2px off its shadow." },
];

const EDIT = `// lib/apexrn/colors.ts
const neoLight: ColorScheme = {
  background: '#FFFFFF',
  primary: '#FF5252',   // change the value, every part follows
  // ...
};`;

function TokenTable({ preset, light, dark }: { preset: string; light: ThemeToken[]; dark: ThemeToken[] }) {
  const darkByName = new Map(dark.map((t) => [t.name, t.value]));
  return (
    <div className="table-scroll">
      <table className="ruled-table token-table">
        <caption className="sr-only">{preset} colour tokens, light and dark</caption>
        <thead>
          <tr>
            <th scope="col" className="mono-label">Token</th>
            <th scope="col" className="mono-label">Light</th>
            <th scope="col" className="mono-label">Dark</th>
            <th scope="col" className="mono-label">Role</th>
          </tr>
        </thead>
        <tbody>
          {light.map((t) => {
            const d = darkByName.get(t.name) ?? "";
            return (
              <tr key={t.name}>
                <th scope="row" className="code">{t.name}</th>
                <td className="code">
                  <span className="swatch" style={{ background: t.value }} aria-hidden="true" /> {t.value}
                </td>
                <td className="code">
                  <span className="swatch" style={{ background: d }} aria-hidden="true" /> {d}
                </td>
                <td className="t-small">{TOKEN_ROLES[t.name] ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Theming() {
  const neo = getPresetTokens("neo");
  const raw = getPresetTokens("raw");
  return (
    <>
      <h1 className="t-h2">Theming</h1>
      <p>
        One file holds every colour: <code>lib/apexrn/colors.ts</code>, copied into your app by{" "}
        <code>npx apexrn init</code>. Parts read colours from the theme and never contain a hex value, so
        editing that file restyles everything.
      </p>

      <section>
        <h2 className="t-h3" id="edit">
          Edit the tokens
        </h2>
        <p>
          Open <code>colors.ts</code> and change the values of the preset you use. Keep each foreground
          token readable on its fill; the library checks 4.5:1 contrast for every pair.
        </p>
        <div className="code-wrap">
          <CodeBlock code={EDIT} />
        </div>
        <p>
          Pick the preset on the provider: <code>{'<ApexRNProvider preset="raw">'}</code>. Default is neo.
        </p>
      </section>

      {PRESETS.map((p) => {
        const t = p.key === "neo" ? neo : raw;
        return (
          <section key={p.key}>
            <h2 className="t-h3" id={`${p.key}-colours`}>
              {p.title} colours
            </h2>
            <p>{p.blurb}</p>
            <TokenTable preset={p.title} light={t.light} dark={t.dark} />
          </section>
        );
      })}

      <section>
        <h2 className="t-h3" id="depth">
          Depth ladder
        </h2>
        <p>
          Elevation is the pixel offset of the hard shadow. Surfaces pick a rung from the preset; raising
          depth moves the shadow, it never blurs it.
        </p>
        <div className="table-scroll">
          <table className="ruled-table">
            <caption className="sr-only">Shadow offset in pixels per elevation, neo and raw</caption>
            <thead>
              <tr>
                <th scope="col" className="mono-label">Elevation</th>
                <th scope="col" className="mono-label">Neo</th>
                <th scope="col" className="mono-label">Raw</th>
                <th scope="col" className="mono-label">Used for</th>
              </tr>
            </thead>
            <tbody>
              {neo.elevation.map((e) => (
                <tr key={e.name}>
                  <th scope="row" className="code">{e.name}</th>
                  <td className="code">{e.value}px</td>
                  <td className="code">{raw.elevation.find((r) => r.name === e.name)?.value}px</td>
                  <td className="t-small">{ELEVATION_ROLES[e.name] ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
