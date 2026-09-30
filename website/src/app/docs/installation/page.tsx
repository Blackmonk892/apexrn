import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/docs/Breadcrumbs";
import TableOfContents, { type TocEntry } from "@/components/docs/TableOfContents";
import CodeBlock from "@/components/docs/CodeBlock";
import { getSetupCode } from "@/lib/docs-data";

export const metadata = {
  title: "Installation — ApexRN docs",
  description: "Initialize ApexRN in an Expo app, wrap your app in the providers, and add your first component.",
};

const TOC: TocEntry[] = [
  { id: "init", label: "Initialize" },
  { id: "providers", label: "Wrap your app" },
  { id: "add", label: "Add a component" },
  { id: "rules", label: "Rules" },
];

export default function InstallationPage() {
  const setupCode = getSetupCode();

  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1 max-w-3xl">
        <Breadcrumbs items={[{ label: "Docs", href: "/docs" }, { label: "Installation" }]} />
        <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">Installation</h1>
        <p className="mt-4 text-[var(--fg-muted)]">
          ApexRN ships as a CLI, not an npm package you import. It copies files into your project — components in{" "}
          <code>components/apexrn</code>, shared code in <code>lib/apexrn</code>.
        </p>

        <h2 id="init" className="font-display mt-10 text-xl font-semibold">1. Initialize</h2>
        <p className="mt-3 text-[var(--fg-muted)]">Run this once, from an Expo project:</p>
        <CodeBlock code="npx apexrn init" filename="terminal" className="mt-3" />
        <p className="mt-3 text-sm text-[var(--fg-muted)]">
          Writes <code>apexrn.json</code>, and copies the theme tokens into <code>lib/apexrn</code>.
        </p>

        <h2 id="providers" className="font-display mt-10 text-xl font-semibold">2. Wrap your app</h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          Wrap your navigation/screens in <code>GestureHandlerRootView</code> and <code>ApexRNProvider</code> (for Expo
          Router, do this in <code>app/_layout.tsx</code>):
        </p>
        {setupCode && <CodeBlock code={setupCode} filename="Providers.tsx" className="mt-3" />}
        <p className="mt-3 text-sm text-[var(--fg-muted)]">
          <code>Toaster</code> is optional — only needed if you use <code>toast()</code>. <code>GestureHandlerRootView</code>{" "}
          is needed by <code>Slider</code>, <code>Sheet</code>, <code>Drawer</code>, and everything built on them.
        </p>

        <h2 id="add" className="font-display mt-10 text-xl font-semibold">3. Add a component</h2>
        <CodeBlock code="npx apexrn add button card dialog" filename="terminal" className="mt-3" />
        <p className="mt-3 text-sm text-[var(--fg-muted)]">
          Dependencies come along automatically — peer packages (Reanimated, worklets, Gesture Handler, SVG, haptics)
          are installed with <code>npx expo install</code> so versions match your Expo SDK. See every component in{" "}
          <Link href="/docs/components" className="underline decoration-[var(--hairline)] hover:text-[var(--fg)]">the component index</Link>.
        </p>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          <code>npx apexrn list</code> shows everything available, <code>npx apexrn diff button</code> shows how your
          copy differs from upstream, and <code>npx apexrn add button --overwrite</code> replaces it.
        </p>

        <h2 id="rules" className="font-display mt-10 text-xl font-semibold">Rules that apply to every component</h2>
        <ul className="mt-3 flex flex-col gap-2.5 text-sm text-[var(--fg-muted)]">
          <li>
            <strong className="text-[var(--fg)]">Import from the barrel:</strong>{" "}
            <code>import {"{ Button, Card }"} from &apos;@/components/apexrn&apos;</code>. Every component is also a
            named export from its own file.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Controlled or uncontrolled.</strong> Omit the controlled prop and it
            manages itself. <code>Sheet</code> is the one exception: it is controlled only.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Variants</strong> share one vocabulary: <code>default</code>,{" "}
            <code>primary</code>, <code>accent</code>, <code>outline</code> for looks and <code>destructive</code>,{" "}
            <code>success</code>, <code>warning</code> for status.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Styling.</strong> <code>style</code> targets the outer wrapper. To
            restyle everything, edit <code>lib/apexrn/colors.ts</code> — see{" "}
            <Link href="/docs/theming" className="underline decoration-[var(--hairline)] hover:text-[var(--fg)]">Theming</Link>.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Safe areas.</strong> <code>AppBar</code>, <code>Drawer</code> and{" "}
            <code>BottomNav</code> take <code>topInset</code>/<code>bottomInset</code>; <code>Toaster</code> takes{" "}
            <code>topInset</code>. Pass them from <code>useSafeAreaInsets()</code>.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Compound parts throw</strong> a clear error if used outside their
            parent.
          </li>
        </ul>

        <div className="mt-12 flex gap-3">
          <Link
            href="/docs/components"
            className="edge-block-sm press-block bg-[var(--fg)] px-4 py-2 text-sm font-semibold text-[var(--bg)]"
          >
            Browse components →
          </Link>
        </div>
      </article>
      <TableOfContents entries={TOC} />
    </div>
  );
}
