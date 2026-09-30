import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/docs/Breadcrumbs";
import TableOfContents, { type TocEntry } from "@/components/docs/TableOfContents";

export const metadata = {
  title: "Introduction — ApexRN docs",
  description: "What ApexRN is, the shadcn-style model it follows, and how components are built from tokens and primitives.",
};

const TOC: TocEntry[] = [
  { id: "what-it-is", label: "What it is" },
  { id: "own-the-code", label: "Own the code" },
  { id: "composition", label: "Composition" },
  { id: "tokens", label: "Tokens + primitives" },
  { id: "controlled", label: "Controlled & uncontrolled" },
  { id: "peers", label: "Dependencies" },
];

export default function IntroductionPage() {
  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1 max-w-3xl">
        <Breadcrumbs items={[{ label: "Docs", href: "/docs" }, { label: "Introduction" }]} />
        <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">Introduction</h1>
        <p className="mt-4 text-[var(--fg-muted)]">
          ApexRN (<code>@apexrn/ui</code>) is a brutalist UI component library for React Native and Expo, built to work
          the way <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer" className="underline decoration-[var(--hairline)] hover:text-[var(--fg)]">shadcn/ui</a> works
          on the web — but for React Native, not the DOM.
        </p>

        <h2 id="what-it-is" className="font-display mt-10 text-xl font-semibold">What it is</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          Thick borders, zero radius, hard offset shadows, flat high-contrast fills, heavy type, and tactile press
          physics — no gradients, blur, or glassmorphism. That visual language lives entirely in a token system and one
          surface primitive, so it can change by swapping tokens, not by rewriting components.
        </p>

        <h2 id="own-the-code" className="font-display mt-10 text-xl font-semibold">Own the code</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          There is no <code>npm install @apexrn/ui</code> for your app to depend on forever. The <code>apexrn</code> CLI
          copies each component&rsquo;s source directly into your project (<code>npx apexrn add button</code>). Each
          component is a small, readable, self-contained file you can open and edit — cross-file coupling is kept
          minimal on purpose, so the CLI can copy one component and its few dependencies.
        </p>

        <h2 id="composition" className="font-display mt-10 text-xl font-semibold">Composition over configuration</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          Compound components (<code>Dialog</code> → <code>DialogTrigger</code>, <code>DialogContent</code>,{" "}
          <code>DialogTitle</code>…) share state through React context and favor explicit slots and{" "}
          <code>asChild</code>-style composition over long prop lists or children-type sniffing. Compound parts throw a
          clear error when used outside their parent.
        </p>

        <h2 id="tokens" className="font-display mt-10 text-xl font-semibold">Tokens + primitives, not copy-paste styles</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          One theme (<code>lib/colors.ts</code>), one surface primitive (<code>BrutalSurface</code>), one style-merge
          helper (<code>cn</code>). Every component is a thin composition of these — see{" "}
          <Link href="/docs/theming" className="underline decoration-[var(--hairline)] hover:text-[var(--fg)]">Theming</Link>.
          A component&rsquo;s look is a small variant/size map resolved from those tokens, never scattered conditionals
          or raw hex values.
        </p>

        <h2 id="controlled" className="font-display mt-10 text-xl font-semibold">Controlled and uncontrolled</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          Anything with state takes <code>value</code>/<code>defaultValue</code>/<code>onValueChange</code> (or{" "}
          <code>open</code>/<code>defaultOpen</code>/<code>onOpenChange</code>, or{" "}
          <code>checked</code>/<code>defaultChecked</code>/<code>onCheckedChange</code>). Omit the controlled prop and
          the component manages its own state. <code>Sheet</code> is the one exception: it is controlled only.
        </p>

        <h2 id="peers" className="font-display mt-10 text-xl font-semibold">Dependencies</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          No runtime dependencies beyond peers: React, React Native, Reanimated, Gesture Handler, SVG, and Expo
          Haptics. Individual components declare which of these they need in the registry, and the CLI installs only
          what a given component actually uses.
        </p>

        <div className="mt-12 flex gap-3">
          <Link
            href="/docs/installation"
            className="edge-block-sm press-block bg-[var(--fg)] px-4 py-2 text-sm font-semibold text-[var(--bg)]"
          >
            Installation →
          </Link>
        </div>
      </article>
      <TableOfContents entries={TOC} />
    </div>
  );
}
