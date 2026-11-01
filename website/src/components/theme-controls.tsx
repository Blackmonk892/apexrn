"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { usePreset, writePreset, type Preset } from "@/lib/preset";

const noopSubscribe = () => () => {};

function Segment<T extends string>({ label, value, options, onChange }: { label: string; value: T | undefined; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="ax-segment">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function ThemeControls() {
  const { resolvedTheme, setTheme } = useTheme();
  const preset = usePreset();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return (
    <div className="ax-theme-controls">
      <Segment label="Colour mode" value={mounted ? (resolvedTheme as "light" | "dark") : undefined} options={["light", "dark"] as const} onChange={setTheme} />
      <Segment<Preset> label="Preset" value={mounted ? preset : undefined} options={["neo", "raw"]} onChange={writePreset} />
    </div>
  );
}
