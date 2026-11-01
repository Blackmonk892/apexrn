import type { ReactNode } from "react";

export function MonoLabel({
  children,
  muted = false,
  as: Tag = "span",
  className = "",
}: {
  children: ReactNode;
  muted?: boolean;
  as?: "span" | "p" | "div";
  className?: string;
}) {
  return (
    <Tag className={`mono-label ${className}`.trim()} data-muted={muted ? "" : undefined}>
      {children}
    </Tag>
  );
}
