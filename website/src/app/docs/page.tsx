import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllComponents, getGroups } from "@/lib/docs-data";

export const metadata = {
  title: "Documentation — ApexRN",
  description: "Install ApexRN, find a component, see it running live, and copy real usage code.",
};

const CARDS = [
  { href: "/docs/introduction", title: "Introduction", desc: "What ApexRN is, and the shadcn-style model it follows: you own the code." },
  { href: "/docs/installation", title: "Installation", desc: "Set up the CLI, wrap your app, and add your first component." },
  { href: "/docs/components", title: "Components", desc: "Every shipped component, grouped the way the registry groups them." },
  { href: "/docs/theming", title: "Theming", desc: "The token system every component reads from — one file, both themes." },
];

export default function DocsHome() {
  const components = getAllComponents();
  const groups = getGroups();

  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">Documentation</p>
        <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Build with ApexRN.</h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-muted)]">
          {components.length} components across {groups.length} groups, each with a live preview, real props and copy-paste
          usage — generated straight from the library source, never hand-written.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="edge-block group flex flex-col justify-between bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-raised)]"
          >
            <div>
              <h2 className="font-display text-lg font-semibold">{card.title}</h2>
              <p className="mt-1.5 text-sm text-[var(--fg-muted)]">{card.desc}</p>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--coral)]">
              Read <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Quick install</h2>
        <div className="edge-block mt-3 bg-[var(--surface)] p-4 font-mono text-sm">
          <p>npx apexrn init</p>
          <p className="mt-1 text-[var(--fg-muted)]">npx apexrn add button card dialog</p>
        </div>
      </div>
    </div>
  );
}
