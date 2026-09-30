"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    title: "Initialize ApexRN in an Expo project",
    command: "npx apexrn init",
    desc: "Writes the config, copies the theme tokens, and wraps your app with ApexRNProvider.",
  },
  {
    title: "Add components as you need them",
    command: "npx apexrn add button card dialog",
    desc: "Copies the component source into your project. Dependencies come along automatically.",
  },
  {
    title: "Import from the barrel",
    command: "import { Button, Card } from '@/components/apexrn';",
    desc: "Every component is also a named export from its own file, if you'd rather import directly.",
  },
];

export default function InstallationSection() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  return (
    <section id="install" className="relative w-full py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionHeading
          index="05"
          label="Setup"
          title="Three commands."
          description="No account, no config wizard. The CLI is a zero-dependency Node script that copies files."
          className="max-w-md"
        />

        <ol className="relative mt-12 flex flex-col gap-6">
          <div
            className="absolute left-[17px] top-[18px] bottom-[18px] hidden w-px bg-[var(--hairline)] sm:block"
            aria-hidden="true"
          />
          {STEPS.map((s, idx) => (
            <motion.li
              key={s.title}
              className="flex gap-5"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-mono relative flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-[var(--edge)] bg-[var(--bg)] text-sm">
                {idx + 1}
              </span>
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">{s.desc}</p>
                <div className="edge-block-sm mt-3 flex items-center justify-between overflow-x-auto bg-[var(--surface)] px-3.5 py-2.5">
                  <code className="font-mono whitespace-nowrap pr-3 text-sm">{s.command}</code>
                  <button
                    onClick={() => handleCopy(s.command, idx)}
                    aria-label={`Copy: ${s.command}`}
                    className="flex-shrink-0 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                  >
                    {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
