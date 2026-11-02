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
    timer.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <button type="button" className="lp-install" onClick={copy} aria-label={`${command} Copy`}>
        <span className="lp-install-face">
          <code className="lp-install-cmd" translate="no">
            {command}
          </code>
          <span className="lp-install-tag" data-copied={copied || undefined} aria-hidden="true">
            <span className="lp-install-flip">
              <span>Copy</span>
              <span>Copied</span>
            </span>
          </span>
        </span>
      </button>
      <span className="lp-sr" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}
