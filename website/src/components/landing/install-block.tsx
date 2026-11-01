"use client";

import { useEffect, useRef, useState } from "react";

export function InstallBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="lp-install">
      <code className="lp-install-cmd" translate="no">
        {command}
      </code>
      <button type="button" className="lp-install-copy" onClick={copy} aria-label={`Copy ${command}`}>
        <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
      </button>
      <span className="lp-sr" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "Copied" : ""}
      </span>
    </div>
  );
}
