import { useSyncExternalStore } from "react";

export type Preset = "neo" | "raw";
export const PRESET_KEY = "apexrn-preset";

// Runs in <head> before first paint so the preset never flashes.
export const PRESET_SCRIPT = `try{var p=localStorage.getItem("${PRESET_KEY}");document.documentElement.dataset.preset=p==="raw"?"raw":"neo"}catch(e){document.documentElement.dataset.preset="neo"}`;

export function readPreset(): Preset {
  return document.documentElement.dataset.preset === "raw" ? "raw" : "neo";
}

export function writePreset(preset: Preset) {
  document.documentElement.dataset.preset = preset;
  try {
    localStorage.setItem(PRESET_KEY, preset);
  } catch {
    // Storage can be blocked; the preset still applies for this visit.
  }
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-preset"] });
  return () => observer.disconnect();
}

export function usePreset(): Preset {
  return useSyncExternalStore(subscribe, readPreset, () => "neo");
}
