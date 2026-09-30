"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getGroups, getAllComponents } from "@/lib/docs-data";

const TOP_LINKS = [
  { href: "/docs/introduction", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/playground", label: "Playground" },
];

export default function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = getGroups();
  const components = getAllComponents();

  const isActive = (href: string) => pathname === href;

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6 text-sm">
      <ul className="flex flex-col gap-0.5">
        {TOP_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`block border-l-2 px-3 py-1.5 font-medium transition-colors ${
                isActive(link.href)
                  ? "border-[var(--coral)] bg-[var(--surface)] text-[var(--fg)]"
                  : "border-transparent text-[var(--fg-muted)] hover:border-[var(--hairline)] hover:text-[var(--fg)]"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/docs/components"
            onClick={onNavigate}
            aria-current={isActive("/docs/components") ? "page" : undefined}
            className={`block border-l-2 px-3 py-1.5 font-medium transition-colors ${
              isActive("/docs/components")
                ? "border-[var(--coral)] bg-[var(--surface)] text-[var(--fg)]"
                : "border-transparent text-[var(--fg-muted)] hover:border-[var(--hairline)] hover:text-[var(--fg)]"
            }`}
          >
            All components
          </Link>
        </li>
      </ul>

      {groups.map((group) => (
        <div key={group.name}>
          <p className="px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            {group.name}
          </p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.components.map((slug) => {
              const component = components.find((c) => c.slug === slug);
              if (!component) return null;
              const href = `/docs/components/${slug}`;
              const active = isActive(href);
              return (
                <li key={slug}>
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
      ))}
    </nav>
  );
}
