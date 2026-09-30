"use client";

import React, { useState } from "react";
import PhoneFrame from "./PhoneFrame";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

/** Names and descriptions verified against registry/meta.json. */
const CATEGORIES = [
  {
    title: "Actions & inputs",
    items: [
      { name: "Button", screen: "button", desc: "Pressable button with variants, sizes, loading state and press physics." },
      { name: "Input", screen: "input", desc: "Text input with label, helper/error text and adornments." },
      { name: "Switch", screen: "switch", desc: "Toggle switch." },
      { name: "Slider", screen: "slider", desc: "Gesture-driven slider." },
    ],
  },
  {
    title: "Display & feedback",
    items: [
      { name: "Badge", screen: "badge", desc: "Small count/status label." },
      { name: "Avatar", screen: "avatar", desc: "Image or initials avatar in a hard-shadowed frame." },
      { name: "Progress", screen: "progress", desc: "Progress bar." },
      { name: "Skeleton", screen: "skeleton", desc: "Loading placeholder." },
    ],
  },
  {
    title: "Overlays & navigation",
    items: [
      { name: "Dialog", screen: "dialog", desc: "Compound modal dialog (Trigger, Content, Title, Description, Footer)." },
      { name: "Sheet", screen: "sheet", desc: "Bottom sheet with drag-to-dismiss." },
      { name: "Tabs", screen: "tabs", desc: "Tabs with a list of triggers and content panels." },
      { name: "Drawer", screen: "drawer", desc: "Side drawer with swipe-to-close, scrim and Android back handling." },
    ],
  },
];

export default function ComponentShowcase() {
  const [active, setActive] = useState(CATEGORIES[0].items[0]);

  return (
    <section id="components" className="relative w-full py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="03"
          label="36 components"
          title="Pick one, watch it run."
          description="A selection below — pick one to mount its live specimen. The rest live in the repository's component docs."
        />

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-10">
            {CATEGORIES.map((cat, catIdx) => (
              <Reveal key={cat.title} delay={catIdx * 0.08}>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-[var(--fg-muted)] opacity-60">
                    {String(catIdx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-sm font-semibold text-[var(--fg-muted)]">{cat.title}</h3>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-px overflow-hidden border-2 border-[var(--hairline)] sm:grid-cols-2">
                  {cat.items.map((item) => {
                    const isActive = active.screen === item.screen;
                    return (
                      <button
                        key={item.screen}
                        onClick={() => setActive(item)}
                        aria-pressed={isActive}
                        className={`group p-4 text-left transition-colors duration-150 ${
                          isActive ? "bg-[var(--surface-raised)]" : "bg-[var(--bg)] hover:bg-[var(--surface)]"
                        }`}
                        style={isActive ? { boxShadow: "inset 3px 0 0 var(--coral)" } : undefined}
                      >
                        <p
                          className={`font-display text-sm font-semibold transition-colors ${
                            isActive ? "text-[var(--fg)]" : "text-[var(--fg)] group-hover:text-[var(--coral)]"
                          }`}
                        >
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1} className="flex items-start justify-center lg:sticky lg:top-24">
            <PhoneFrame screen={active.screen} maxWidth={280} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
