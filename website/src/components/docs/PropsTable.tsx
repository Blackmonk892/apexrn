import React from "react";
import type { PropEntry } from "@/lib/docs-data";

export default function PropsTable({ props }: { props: PropEntry[] }) {
  if (!props.length) {
    return (
      <p className="text-sm text-[var(--fg-muted)]">
        No documented props extracted for this type — it may compose purely through children.
      </p>
    );
  }

  return (
    <div className="edge-block overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-[var(--edge)] bg-[var(--surface)] text-left">
            <th className="px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Prop</th>
            <th className="px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Type</th>
            <th className="px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Default</th>
            <th className="px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop, i) => (
            <tr key={prop.name} className={i % 2 === 1 ? "bg-[var(--surface)]/40" : undefined}>
              <td className="border-t border-[var(--hairline)] px-3 py-2 align-top font-mono text-xs">
                {prop.name}
                {!prop.optional && <span className="ml-1 text-[var(--coral)]">*</span>}
              </td>
              <td className="border-t border-[var(--hairline)] px-3 py-2 align-top font-mono text-xs text-[var(--fg-muted)]">
                {prop.type}
              </td>
              <td className="border-t border-[var(--hairline)] px-3 py-2 align-top font-mono text-xs text-[var(--fg-muted)]">
                {prop.default ?? "—"}
              </td>
              <td className="border-t border-[var(--hairline)] px-3 py-2 align-top text-[var(--fg-muted)]">
                {prop.description || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--fg-muted)]">
        <span className="text-[var(--coral)]">*</span> required
      </p>
    </div>
  );
}
