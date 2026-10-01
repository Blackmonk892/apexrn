"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import ContrastDemo from "./ContrastDemo";
import Reveal from "./Reveal";

const INIT_COMMAND = "npx apexrn init";

function CopyInstall({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <div className="edge-block flex items-center bg-[var(--surface)]">
      <span className="font-mono px-4 py-3 text-sm text-[var(--fg)]">{INIT_COMMAND}</span>
      <button
        onClick={onCopy}
        aria-label="Copy installation command"
        className="flex items-center gap-1.5 border-l-2 border-[var(--edge)] px-3 py-3 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
}

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(INIT_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="relative w-full overflow-hidden bg-grid px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pb-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <Reveal>
          <p className="font-mono text-sm text-[var(--fg-muted)]">React Native · Expo · TypeScript</p>

          <h1 className="font-display mt-4 max-w-xl text-[12vw] font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-[3.6rem]">
            Every rounded corner is a decision you didn&apos;t make.
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--fg-muted)]">
            ApexRN is a component library you copy into your Expo app and keep — thick borders, hard
            offset shadows, real press physics. No package to patch around; the file in your editor is the
            whole component.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CopyInstall copied={copied} onCopy={handleCopy} />
            <a
              href="#explore"
              className="press-block px-4 py-3 text-sm font-semibold text-[var(--fg)] underline decoration-2 underline-offset-4 decoration-[var(--coral)]"
            >
              See it running
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex justify-center lg:justify-end">
          <ContrastDemo />
        </Reveal>
      </div>
    </section>
  );
}
