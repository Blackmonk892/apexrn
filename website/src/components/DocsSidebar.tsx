"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Part } from "@/lib/parts";

const START = [
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/docs/cli", label: "CLI" },
];

/** Same list in the sticky desktop column and the mobile disclosure. */
export function DocsNav({ parts }: { parts: Pick<Part, "slug" | "name" | "number">[] }) {
  const pathname = (usePathname() ?? "").replace(/\/$/, "");
  const current = (href: string) => (pathname === href ? "page" : undefined);
  return (
    <nav aria-label="Docs">
      <p className="mono-label docs-nav-heading">Getting started</p>
      <ul className="docs-nav-list">
        {START.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="docs-nav-link" aria-current={current(l.href)}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mono-label docs-nav-heading">Components</p>
      <ul className="docs-nav-list">
        {parts.map((p) => {
          const href = `/docs/components/${p.slug}`;
          return (
            <li key={p.slug}>
              <Link href={href} className="docs-nav-link" aria-current={current(href)}>
                <span className="mono-label docs-nav-no">{p.number}</span> {p.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DocsSidebar({ parts }: { parts: Pick<Part, "slug" | "name" | "number">[] }) {
  return (
    <aside className="docs-sidebar">
      <DocsNav parts={parts} />
    </aside>
  );
}

export function DocsMobileNav({ parts }: { parts: Pick<Part, "slug" | "name" | "number">[] }) {
  return (
    <details className="docs-mobile-nav">
      <summary className="btn mono-label">Docs menu and parts</summary>
      <div className="docs-mobile-panel">
        <DocsNav parts={parts} />
      </div>
    </details>
  );
}
