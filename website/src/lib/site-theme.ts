"use client";

import { useSyncExternalStore } from "react";
import { BASE_PATH } from "./base-path";

export type Mode = "light" | "dark";
export type Preset = "neo" | "raw";

export const MODE_KEY = "apexrn-site-theme";
export const PRESET_KEY = "apexrn-site-preset";

/** Runs before first paint (inlined in layout) so the page never flashes the wrong theme. */
export const NO_FLASH_SCRIPT = `(function(){var d=document.documentElement;try{var m=localStorage.getItem("${MODE_KEY}");if(m!=="light"&&m!=="dark"){m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var p=localStorage.getItem("${PRESET_KEY}");if(p!=="neo"&&p!=="raw"){p="neo"}d.setAttribute("data-theme",m);d.setAttribute("data-preset",p)}catch(e){d.setAttribute("data-theme","light");d.setAttribute("data-preset","neo")}})();`;

const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function readMode(): Mode {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
function readPreset(): Preset {
  return document.documentElement.getAttribute("data-preset") === "raw" ? "raw" : "neo";
}

export function useMode(): Mode {
  return useSyncExternalStore(subscribe, readMode, () => "light");
}
export function usePreset(): Preset {
  return useSyncExternalStore(subscribe, readPreset, () => "neo");
}

/**
 * Preview iframes tag themselves with data-apexrn-preview. Messages use the preview
 * protocol's `apexrn:` namespace. Same-origin only: previews ship in public/preview.
 */
function iframes(): HTMLIFrameElement[] {
  return Array.from(document.querySelectorAll<HTMLIFrameElement>("iframe[data-apexrn-preview]"));
}

/** Call when a preview reports `apexrn:ready`, so a late-loading iframe catches up. */
export function sendThemeTo(iframe: HTMLIFrameElement) {
  const target = iframe.contentWindow;
  if (!target) return;
  target.postMessage({ type: "apexrn:theme", mode: readMode() }, window.location.origin);
  target.postMessage({ type: "apexrn:preset", preset: readPreset() }, window.location.origin);
}

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the attribute still applies for this page view.
  }
}

export function setMode(mode: Mode) {
  document.documentElement.setAttribute("data-theme", mode);
  persist(MODE_KEY, mode);
  listeners.forEach((l) => l());
  iframes().forEach((f) => f.contentWindow?.postMessage({ type: "apexrn:theme", mode }, window.location.origin));
}

export function setPreset(preset: Preset) {
  document.documentElement.setAttribute("data-preset", preset);
  persist(PRESET_KEY, preset);
  listeners.forEach((l) => l());
  iframes().forEach((f) => f.contentWindow?.postMessage({ type: "apexrn:preset", preset }, window.location.origin));
}

export function previewUrl(hash = ""): string {
  return `${BASE_PATH}/preview/index.html${hash}`;
}
