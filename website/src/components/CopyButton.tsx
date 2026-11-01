"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard needs a secure context and a user gesture; the text stays selectable.
    }
  }

  return (
    <button type="button" className="btn mono-label" onClick={copy} aria-label={`${label}: ${text}`}>
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
