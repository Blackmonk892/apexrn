"use client";

import { useSyncExternalStore } from "react";
import { PRESET_KEY } from "./preset-script";

export type Preset = "neo" | "raw";

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
