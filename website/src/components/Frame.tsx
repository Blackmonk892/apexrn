import type { ReactNode } from "react";

interface FrameProps {
  children: ReactNode;
  /** Hard offset shadow: `card` is 4px, `phone` is 6px (2px in the raw preset). */
  shadow?: "card" | "phone";
  className?: string;
}

export function Frame({ children, shadow, className = "" }: FrameProps) {
  return (
    <div className={`frame ${className}`.trim()} data-shadow={shadow}>
      {children}
    </div>
  );
}
