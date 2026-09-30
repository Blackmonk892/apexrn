"use client";

import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Sun, Moon } from "lucide-react";

interface ComponentPreviewProps {
  /** Lab hash route id, e.g. "button", "alertdialog". */
  screen: string;
  /** True when this component has no dedicated Lab specimen and falls back to a related one. */
  isFallback?: boolean;
  fallbackNote?: string;
}

export default function ComponentPreview({ screen, isFallback, fallbackNote }: ComponentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "apexrn:ready") setIsReady(true);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "apexrn:theme", mode: theme }, window.location.origin);
  }, [theme, isReady]);

  useEffect(() => {
    if (!isReady) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const send = (reduced: boolean) =>
      iframeRef.current?.contentWindow?.postMessage({ type: "apexrn:reducedMotion", value: reduced }, window.location.origin);
    send(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => send(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [isReady]);

  const iframeSrc = `/lab/index.html?embed=1#${screen}:${theme}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center border-2 border-[var(--hairline)]">
          <button
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              theme === "light" ? "bg-[var(--fg)] text-[var(--bg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <Sun size={13} /> Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
            className={`flex items-center gap-1.5 border-l-2 border-[var(--hairline)] px-3 py-1.5 text-xs font-medium transition-colors ${
              theme === "dark" ? "bg-[var(--fg)] text-[var(--bg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <Moon size={13} /> Dark
          </button>
        </div>
        <a
          href={iframeSrc}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        >
          Open standalone <ExternalLink size={12} />
        </a>
      </div>

      <div
        ref={containerRef}
        className="edge-block relative overflow-hidden bg-[var(--surface)]"
        style={{ minHeight: 420 }}
      >
        {(!shouldMount || !isReady) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="edge-block-sm flex h-9 w-9 items-center justify-center bg-[var(--coral)] font-display text-sm font-bold text-[var(--coral-ink)]">
              N
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[var(--fg-muted)]">ApexRN Lab — booting</p>
          </div>
        )}
        {shouldMount && (
          <iframe
            ref={iframeRef}
            data-apexrn-lab
            src={iframeSrc}
            title={`ApexRN ${screen} component preview, running in the web build of the demo Lab`}
            className="h-[480px] w-full border-0"
            loading="lazy"
            style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s ease" }}
          />
        )}
      </div>

      <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
        <strong className="text-[var(--fg)]">Known limits:</strong> this is a web render of the real, compiled{" "}
        <code>@apexrn/ui</code> build via react-native-web, running inside the Lab. Haptics, native{" "}
        <code>Modal</code> window behavior, and some native gestures differ on an actual device.
        {isFallback && fallbackNote ? <> {fallbackNote}</> : null}
      </p>
    </div>
  );
}
