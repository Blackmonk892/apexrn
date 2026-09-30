"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPlaygroundComponents } from "@/lib/playground-config";

export default function PlaygroundSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const components = getPlaygroundComponents();

  return (
    <nav aria-label="Playground components" className="flex flex-col gap-6 text-sm">
      <ul className="flex flex-col gap-0.5">
        <li>
          <Link
            href="/docs/components"
            onClick={onNavigate}
            className="block border-l-2 border-transparent px-3 py-1.5 font-medium text-[var(--fg-muted)] transition-colors hover:border-[var(--hairline)] hover:text-[var(--fg)]"
          >
            ← All docs
          </Link>
        </li>
      </ul>
      <div>
        <p className="px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
          Playground
        </p>
        <ul className="mt-2 flex flex-col gap-0.5">
          {components.map(({ component }) => {
            const href = `/playground/${component.slug}`;
            const active = pathname === href;
            return (
              <li key={component.slug}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`block border-l-2 px-3 py-1.5 transition-colors ${
                    active
                      ? "border-[var(--coral)] bg-[var(--surface)] font-medium text-[var(--fg)]"
                      : "border-transparent text-[var(--fg-muted)] hover:border-[var(--hairline)] hover:text-[var(--fg)]"
                  }`}
                >
                  {component.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
