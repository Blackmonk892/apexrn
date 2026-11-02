"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { usePreset, writePreset, type Preset } from "@/lib/preset";

const noopSubscribe = () => () => {};

interface Option<T extends string> {
  value: T;
  label: string;
}

function Switch<T extends string>({ label, current, options, onChange }: { label: string; current: T | undefined; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="lp-switch" role="group" aria-label={label}>
      <span className="lp-label" aria-hidden="true">
        {label}
      </span>
      <div className="lp-switch-options">
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={current === o.value} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LooksControls() {
  const { resolvedTheme, setTheme } = useTheme();
  const preset = usePreset();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return (
    <div className="lp-switches">
      <Switch<"light" | "dark">
        label="Colour mode"
        current={mounted ? (resolvedTheme === "dark" ? "dark" : "light") : undefined}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        onChange={setTheme}
      />
      <Switch<Preset>
        label="Preset"
        current={mounted ? preset : undefined}
        options={[
          { value: "neo", label: "Neo" },
          { value: "raw", label: "Raw" },
        ]}
        onChange={writePreset}
      />
    </div>
  );
}
