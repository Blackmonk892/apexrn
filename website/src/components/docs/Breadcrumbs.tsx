import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs text-[var(--fg-muted)]">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <ChevronRight size={11} className="opacity-50" />}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-[var(--fg)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--fg)]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
