"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

/** Every component the registry actually ships (registry/meta.json), title-cased. Real content, not filler. */
const NAMES = [
  "Accordion", "Alert", "Alert Dialog", "App Bar", "Avatar", "Badge", "Bottom Nav", "Brutal Surface",
  "Button", "Card", "Carousel", "Checkbox", "Chip", "Date Picker", "Dialog", "Drawer", "Dropdown Menu",
  "Floating Action Button", "Input", "Input OTP", "Label", "List Item", "Marquee", "Progress",
  "Radio Group", "Search Bar", "Select", "Separator", "Sheet", "Skeleton", "Slider", "Switch", "Tabs",
  "Textarea", "Toast", "Toaster",
];

function Row({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex flex-shrink-0 items-center" aria-hidden={ariaHidden}>
      {NAMES.map((name) => (
        <span key={name} className="flex items-center">
          <span className="font-display px-5 text-lg font-semibold whitespace-nowrap sm:text-xl">{name}</span>
          <span className="h-2.5 w-2.5 flex-shrink-0 bg-[var(--coral)]" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

/** 36 real registry entries, scrolling. Pauses on hover/focus; a static wrapped list under reduced motion. */
export default function ComponentTicker() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="border-y-2 border-[var(--edge)] bg-[var(--fg)] px-5 py-4 text-[var(--bg)] sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2">
          {NAMES.map((name) => (
            <span key={name} className="font-display text-sm font-semibold">
              {name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="group overflow-hidden border-y-2 border-[var(--edge)] bg-[var(--fg)] text-[var(--bg)]"
      role="list"
      aria-label="36 components shipped in the registry"
    >
      <div className="ticker-track flex w-max py-4 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}
