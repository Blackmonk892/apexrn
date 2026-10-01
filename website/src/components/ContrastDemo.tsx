"use client";

import React, { useState } from "react";

type Mode = "default" | "apex";

/**
 * The hero's one interactive moment: the same three UI pieces (card, button, toggle)
 * rendered twice, switched with a literal flip instead of a scroll animation — the
 * fastest way to show what "brutalist, not rounded-default" actually means.
 * The style swap is an instant cut, never a crossfade: smoothing it would undercut the point.
 */
export default function ContrastDemo() {
  const [mode, setMode] = useState<Mode>("apex");
  const isApex = mode === "apex";

  return (
    <div className="w-full max-w-sm">
      <div className="edge-block-sm grid grid-cols-2 bg-[var(--surface)]">
        {(["default", "apex"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`press-block font-mono px-4 py-2.5 text-sm font-semibold transition-colors ${
              mode === m ? "bg-[var(--coral)] text-[var(--coral-ink)]" : "text-[var(--fg-muted)]"
            }`}
          >
            {m === "default" ? "Default kit" : "ApexRN"}
          </button>
        ))}
      </div>

      <div
        className={
          isApex
            ? "mt-4 border-[3px] border-[var(--edge)] bg-[var(--surface-raised)] p-5 shadow-[7px_7px_0_0_var(--edge)]"
            : "mt-4 rounded-2xl border border-black/5 bg-white p-5 text-[#1a1a1a] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.25)]"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={isApex ? "font-display text-base font-bold" : "text-base font-semibold text-[#1a1a1a]"}>
              Push notifications
            </p>
            <p className={isApex ? "mt-1 text-sm text-[var(--fg-muted)]" : "mt-1 text-sm text-[#6b6b6b]"}>
              Get a ping when someone replies.
            </p>
          </div>
          <span
            className={
              isApex
                ? "font-mono flex-shrink-0 border-2 border-[var(--edge)] bg-[var(--signal)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--signal-ink)]"
                : "flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400 px-2 py-0.5 text-[10px] font-medium text-white"
            }
          >
            New
          </span>
        </div>

        <button
          className={
            isApex
              ? "press-block mt-5 w-full border-2 border-[var(--edge)] bg-[var(--fg)] py-2.5 text-sm font-semibold text-[var(--bg)]"
              : "mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
          }
        >
          Enable
        </button>
      </div>

      <p className="font-mono mt-3 text-xs text-[var(--fg-muted)]">
        {isApex ? "Same button, same props — a different theme file." : "This is what most kits ship by default."}
      </p>
    </div>
  );
}
