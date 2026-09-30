"use client";

import React from "react";
import PhoneFrame from "./PhoneFrame";
import Reveal from "./Reveal";

const PIECES = [
  { name: "Button", tag: "button", desc: "Pressable button with variants, sizes, loading state and press physics." },
  { name: "Card", tag: "card", desc: "Bordered container with header/footer slots; pressable when given onPress." },
  { name: "Switch", tag: "switch", desc: "Controlled or uncontrolled toggle switch." },
  { name: "Tabs", tag: "tabs", desc: "Tabs with a list of triggers and content panels." },
];

export default function PhoneStorySection() {
  return (
    <section className="relative w-full bg-[var(--surface)] py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal className="flex justify-center lg:justify-start">
            <PhoneFrame screen="showcase" maxWidth={280} />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold tracking-[0.2em] text-[var(--coral)]">01</span>
              <span className="h-px w-7 bg-[var(--hairline)]" aria-hidden="true" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--fg-muted)]">
                Not a mockup
              </span>
            </div>

            <h2 className="font-display mt-4 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
              What you just saw is running code.
            </h2>
            <p className="mt-4 max-w-md text-[var(--fg-muted)]">
              That screen is the real, compiled <code className="font-mono text-[var(--fg)]">@apexrn/ui</code>{" "}
              running in a browser. It&apos;s assembled from a handful of the same primitives you&apos;d copy into
              your own app:
            </p>

            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {PIECES.map((p, i) => (
                <li key={p.tag} className="flex gap-3">
                  <span className="font-mono mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center border border-[var(--hairline)] text-[10px] text-[var(--fg-muted)]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-base font-semibold">{p.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
