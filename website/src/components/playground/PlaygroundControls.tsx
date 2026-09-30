"use client";

import React from "react";
import type { ResolvedControl } from "@/lib/playground-config";
import type { PlaygroundValues } from "@/lib/playground-codegen";

interface PlaygroundControlsProps {
  controls: ResolvedControl[];
  values: PlaygroundValues;
  onChange: (prop: string, value: string | number | boolean) => void;
}

export default function PlaygroundControls({ controls, values, onChange }: PlaygroundControlsProps) {
  return (
    <div className="flex flex-col gap-5">
      {controls.map((control) => {
        const value = values[control.prop] ?? control.default;
        return (
          <div key={control.prop} className="flex flex-col gap-1.5">
            <label htmlFor={`control-${control.prop}`} className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                {control.label}
              </span>
              {control.type === "range" && (
                <span className="font-mono text-xs text-[var(--fg)]">{value}</span>
              )}
            </label>

            {control.type === "select" && (
              <select
                id={`control-${control.prop}`}
                value={String(value)}
                onChange={(e) => onChange(control.prop, e.target.value)}
                className="border-2 border-[var(--hairline)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--fg)] transition-colors focus:border-[var(--focus)] focus:outline-none"
              >
                {control.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {control.type === "boolean" && (
              <button
                id={`control-${control.prop}`}
                type="button"
                role="switch"
                aria-checked={!!value}
                onClick={() => onChange(control.prop, !value)}
                className={`flex h-9 w-16 items-center border-2 border-[var(--hairline)] px-1 transition-colors ${
                  value ? "justify-end bg-[var(--fg)]" : "justify-start bg-[var(--surface)]"
                }`}
              >
                <span
                  className={`h-5 w-5 border-2 ${
                    value ? "border-[var(--bg)] bg-[var(--coral)]" : "border-[var(--hairline)] bg-[var(--fg-muted)]"
                  }`}
                />
              </button>
            )}

            {control.type === "range" && control.range && (
              <input
                id={`control-${control.prop}`}
                type="range"
                min={control.range.min}
                max={control.range.max}
                step={control.range.step}
                value={Number(value)}
                onChange={(e) => onChange(control.prop, Number(e.target.value))}
                className="w-full accent-[var(--coral)]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
