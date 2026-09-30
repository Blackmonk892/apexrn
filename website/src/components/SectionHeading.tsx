import React from "react";

interface SectionHeadingProps {
  /** Two-digit section index, e.g. "01" — a technical label, not decoration. */
  index: string;
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  index,
  label,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <span className="font-mono text-xs font-semibold tracking-[0.2em] text-[var(--coral)]">{index}</span>
        <span className="h-px w-7 bg-[var(--hairline)]" aria-hidden="true" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--fg-muted)]">
          {label}
        </span>
      </div>
      <h2 className="font-display mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-[var(--fg-muted)]">{description}</p>}
    </div>
  );
}
