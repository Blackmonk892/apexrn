"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlightLine } from "@/lib/highlight";

interface CodeBlockProps {
  code: string;
  filename?: string;
  className?: string;
}

export default function CodeBlock({ code, filename, className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`edge-block overflow-hidden bg-[var(--surface)] ${className}`}>
      <div className="flex items-center justify-between border-b-2 border-[var(--edge)] px-4 py-2">
        <span className="font-mono text-xs text-[var(--fg-muted)]">{filename ?? "tsx"}</span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed">
        <code className="font-mono">
          {code.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 w-6 flex-shrink-0 select-none text-right text-[var(--fg-muted)] opacity-50">{i + 1}</span>
              <span className="whitespace-pre">{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
