import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DocComponent } from "@/lib/docs-data";

export default function PrevNextNav({ prev, next }: { prev: DocComponent | null; next: DocComponent | null }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Component navigation" className="mt-4 grid grid-cols-1 gap-3 border-t-2 border-[var(--edge)] pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/components/${prev.slug}`}
          className="edge-block-sm flex flex-col gap-1 bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--surface-raised)]"
        >
          <span className="flex items-center gap-1 text-xs text-[var(--fg-muted)]">
            <ArrowLeft size={12} /> Previous
          </span>
          <span className="font-display text-sm font-semibold">{prev.name}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/docs/components/${next.slug}`}
          className="edge-block-sm flex flex-col items-end gap-1 bg-[var(--surface)] px-4 py-3 text-right transition-colors hover:bg-[var(--surface-raised)] sm:col-start-2"
        >
          <span className="flex items-center gap-1 text-xs text-[var(--fg-muted)]">
            Next <ArrowRight size={12} />
          </span>
          <span className="font-display text-sm font-semibold">{next.name}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
