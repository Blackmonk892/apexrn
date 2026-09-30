import React from "react";
import Breadcrumbs from "@/components/docs/Breadcrumbs";
import TableOfContents, { type TocEntry } from "@/components/docs/TableOfContents";
import { getTokens } from "@/lib/docs-data";

export const metadata = {
  title: "Theming — ApexRN docs",
  description: "The token system every ApexRN component reads from: colors, spacing, typography — one file, both themes.",
};

const TOC: TocEntry[] = [
  { id: "colors", label: "Colors" },
  { id: "spacing", label: "Spacing" },
  { id: "typography", label: "Typography" },
  { id: "metrics", label: "Borders, shadows & motion" },
];

function swatchRow(name: string, light: string, dark: string) {
  return (
    <tr key={name} className="border-t border-[var(--hairline)]">
      <td className="px-3 py-2 font-mono text-xs">{name}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 flex-shrink-0 border-2 border-[var(--edge)]" style={{ backgroundColor: light }} />
          <span className="font-mono text-xs text-[var(--fg-muted)]">{light}</span>
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 flex-shrink-0 border-2 border-[var(--edge)]" style={{ backgroundColor: dark }} />
          <span className="font-mono text-xs text-[var(--fg-muted)]">{dark}</span>
        </div>
      </td>
    </tr>
  );
}

export default function ThemingPage() {
  const tokens = getTokens();
  const darkByName = Object.fromEntries(tokens.dark.map((t) => [t.name, t.value]));

  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1 max-w-3xl">
        <Breadcrumbs items={[{ label: "Docs", href: "/docs" }, { label: "Theming" }]} />
        <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">Theming</h1>
        <p className="mt-4 text-[var(--fg-muted)]">
          Every component reads colors from <code>useTheme().colors</code> — never a hex literal, never{" "}
          <code>colors.light</code>/<code>colors.dark</code> read directly. Restyle the whole library by editing one
          file: <code>lib/apexrn/colors.ts</code> (copied into your project by <code>npx apexrn init</code>).
        </p>

        <h2 id="colors" className="font-display mt-10 text-xl font-semibold">Colors</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          The current defaults, extracted directly from <code>packages/ui/lib/colors.ts</code>. Every
          foreground/background pair must meet 4.5:1 contrast in both themes — enforced by{" "}
          <code>node registry/check-contrast.mjs</code> in CI.
        </p>
        <div className="edge-block mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--edge)] bg-[var(--surface)] text-left">
                <th className="px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Token</th>
                <th className="px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Light</th>
                <th className="px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Dark</th>
              </tr>
            </thead>
            <tbody>{tokens.light.map((t) => swatchRow(t.name, t.value, darkByName[t.name] ?? "#000000"))}</tbody>
          </table>
        </div>

        <h2 id="spacing" className="font-display mt-10 text-xl font-semibold">Spacing</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          Read at render time (not frozen at import) via <code>moderateScale()</code>, so spacing adapts to window size,
          rotation and foldables. Base values below are the 1× reference.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tokens.spacing.map((t) => (
            <div key={t.name} className="edge-block-sm flex items-center gap-2 bg-[var(--surface)] px-3 py-2">
              <span className="font-mono text-xs text-[var(--fg-muted)]">{t.name}</span>
              <span className="h-px flex-shrink-0 bg-[var(--fg)]" style={{ width: Math.min(t.base, 48) }} />
              <span className="font-mono text-xs">{t.base}pt</span>
            </div>
          ))}
        </div>

        <h2 id="typography" className="font-display mt-10 text-xl font-semibold">Typography</h2>
        <p className="mt-3 text-[var(--fg-muted)]">Via <code>normalize()</code>, which also respects the system font-scale setting.</p>
        <div className="mt-4 flex flex-col gap-2">
          {tokens.typography.map((t) => (
            <div key={t.name} className="flex items-baseline gap-3 border-b border-[var(--hairline)] py-1.5">
              <span className="w-10 font-mono text-xs text-[var(--fg-muted)]">{t.name}</span>
              <span className="font-display" style={{ fontSize: Math.min(t.base, 32) }}>
                Aa {t.base}
              </span>
            </div>
          ))}
        </div>

        <h2 id="metrics" className="font-display mt-10 text-xl font-semibold">Borders, shadows &amp; motion</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Border widths</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-[var(--fg-muted)]">
              {tokens.borderWidths.map((t) => (
                <li key={t.name}>
                  <code>{t.name}</code>: {t.value}px
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Shadow offset</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-[var(--fg-muted)]">
              {tokens.shadowOffset.map((t) => (
                <li key={t.name}>
                  <code>{t.name}</code>: <code>{t.value}</code>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Control height</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-[var(--fg-muted)]">
              {tokens.controlHeight.map((t) => (
                <li key={t.name}>
                  <code>{t.name}</code>: {t.value}pt
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Touch target</p>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              <code>{tokens.touchTarget}</code> — 44pt on iOS (HIG), 48dp on Android (Material).
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-[var(--fg-muted)]">
          Static values like border width and shadow offset may stay module-level constants; anything that depends on
          window size or accessibility settings — like spacing and typography — is always read at render time.
        </p>
      </article>
      <TableOfContents entries={TOC} />
    </div>
  );
}
