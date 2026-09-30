"use client";

import React, { useEffect, useState } from "react";

export interface TocEntry {
  id: string;
  label: string;
}

export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const elements = entries.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (obsEntries) => {
        const visible = obsEntries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  if (!entries.length) return null;

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-48 flex-shrink-0 overflow-y-auto xl:block">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">On this page</p>
      <ul className="mt-3 flex flex-col gap-1.5 border-l border-[var(--hairline)]">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={`block -ml-px border-l-2 py-0.5 pl-3 text-xs transition-colors ${
                activeId === entry.id
                  ? "border-[var(--coral)] text-[var(--fg)]"
                  : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
