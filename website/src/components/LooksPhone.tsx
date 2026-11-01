"use client";

import { useRef, useState, type ReactNode } from "react";
import { SHOWCASE_URL } from "@/lib/base-path";
import type { Mode, Preset } from "@/lib/site-theme";
import { PhoneFrame } from "./PhoneFrame";

/** One phone driven only by its own two switches; the site-wide theme never reaches it. */
export function LooksPhone({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const [preset, setPreset] = useState<Preset>("neo");
  const target = useRef<Window | null>(null);

  const touched = useRef(false);

  function send(next: { mode?: Mode; preset?: Preset }) {
    if (next.mode) target.current?.postMessage({ type: "apexrn:theme", mode: next.mode }, window.location.origin);
    if (next.preset) target.current?.postMessage({ type: "apexrn:preset", preset: next.preset }, window.location.origin);
  }

  return (
    <div className="looks-layout">
      <div className="looks-text">
        {children}
        <div className="looks-controls">
          <div className="seg" role="group" aria-label="Preset for this phone">
            {(["neo", "raw"] as const).map((p) => (
              <button
                key={p}
                type="button"
                className="btn mono-label"
                aria-pressed={preset === p}
                onClick={() => {
                  setPreset(p);
                  send({ preset: p });
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="seg" role="group" aria-label="Colour mode for this phone">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className="btn mono-label"
                aria-pressed={mode === m}
                onClick={() => {
                  touched.current = true;
                  setMode(m);
                  send({ mode: m });
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="looks-phone">
        <PhoneFrame
          src={SHOWCASE_URL}
          title="ApexRN preview with its own look switches"
          followSite={false}
          onReady={(w) => {
            target.current = w;
            // Start in the site's current mode, read when the preview reports ready (after mount, so no hydration mismatch).
            const m: Mode = touched.current
              ? mode
              : document.documentElement.getAttribute("data-theme") === "dark"
                ? "dark"
                : "light";
            setMode(m);
            send({ mode: m, preset });
          }}
        />
      </div>
    </div>
  );
}
