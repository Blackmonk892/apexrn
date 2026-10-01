"use client";

import React from "react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const LEAD = {
  title: "You own the code",
  desc: "The CLI copies each component's source straight into your project. There's no package to patch around, no black-box internals to fight — you edit the file, directly, like you wrote it yourself.",
};

const PRINCIPLES = [
  {
    title: "One file changes the look",
    desc: "Every component reads its colors from a single token file. A contrast-check script in the repo enforces a 4.5:1 minimum on every token pair, in both themes.",
  },
  {
    title: "Strict TypeScript, no escape hatches",
    desc: "The whole library builds under strict mode with unused locals and params as errors. Public APIs don't use any.",
  },
  {
    title: "Built for Expo",
    desc: "Targets the current Expo SDK, with Reanimated, Gesture Handler and SVG as the only runtime peers — no extra dependencies to install.",
  },
];

export default function PhilosophySection() {
  return (
    <section className="relative w-full bg-[var(--surface)] py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title="Most kits converge on the same look. This one doesn't."
          description="Rounded corners, soft grey shadows and a pastel accent are the default everywhere. ApexRN is a deliberate departure — and a few decisions about how it's built."
          className="max-w-lg"
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <Reveal className="border-[3px] border-[var(--edge)] bg-[var(--surface-raised)] p-7 shadow-[7px_7px_0_0_var(--edge)]">
            <h3 className="font-display text-2xl font-semibold leading-snug">{LEAD.title}</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--fg-muted)]">{LEAD.desc}</p>
          </Reveal>

          <div className="flex flex-col gap-8">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={(i + 1) * 0.08} className="border-l-2 border-[var(--hairline)] pl-5">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{p.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
