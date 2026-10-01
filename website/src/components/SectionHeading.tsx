import React from "react";

interface SectionHeadingProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Only for content that is genuinely sequential (e.g. numbered install steps). Omit otherwise. */
  kicker?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  title,
  description,
  kicker,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      {kicker && <p className="font-mono text-sm text-[var(--coral)]">{kicker}</p>}
      <h2 className="font-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-[var(--fg-muted)]">{description}</p>}
    </div>
  );
}
