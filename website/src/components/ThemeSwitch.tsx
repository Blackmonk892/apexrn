"use client";

import { setMode, setPreset, useMode, usePreset } from "@/lib/site-theme";

/** Two segmented controls: light/dark and neo/raw. Text labels, no icons. */
export function ThemeSwitch() {
  const mode = useMode();
  const preset = usePreset();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <div className="seg" role="group" aria-label="Colour mode">
        <button type="button" className="btn mono-label" aria-pressed={mode === "light"} onClick={() => setMode("light")}>
          Light
        </button>
        <button type="button" className="btn mono-label" aria-pressed={mode === "dark"} onClick={() => setMode("dark")}>
          Dark
        </button>
      </div>
      <div className="seg" role="group" aria-label="Preset">
        <button type="button" className="btn mono-label" aria-pressed={preset === "neo"} onClick={() => setPreset("neo")}>
          Neo
        </button>
        <button type="button" className="btn mono-label" aria-pressed={preset === "raw"} onClick={() => setPreset("raw")}>
          Raw
        </button>
      </div>
    </div>
  );
}
