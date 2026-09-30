import React from "react";
import Link from "next/link";
import type { DocComponent } from "@/lib/docs-data";

export default function RelatedComponents({ components }: { components: DocComponent[] }) {
  if (!components.length) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {components.map((c) => (
        <Link
          key={c.slug}
          href={`/docs/components/${c.slug}`}
          className="edge-block-sm block bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--surface-raised)]"
        >
          <p className="font-display text-sm font-semibold">{c.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">{c.description}</p>
        </Link>
      ))}
    </div>
  );
}
