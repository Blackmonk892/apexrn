"use client";

import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, Sun, Moon } from "lucide-react";
import type { PlaygroundValues } from "@/lib/playground-codegen";

const READY_TIMEOUT_MS = 8000;
const PROPS_DEBOUNCE_MS = 80;

interface PlaygroundPreviewProps {
  /** Lab hash route id, e.g. "button". */
  slug: string;
  values: PlaygroundValues;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

export default function PlaygroundPreview({ slug, values, theme, onThemeChange }: PlaygroundPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // Bumping this changes the iframe's `src`/`key`, which is the only thing that reloads it —
  // control changes below never touch this, they go through postMessage.
  const [reloadToken, setReloadToken] = useState(0);

  const isReadyRef = useRef(false);
  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  // Ready handshake + timeout: if `apexrn:ready` never arrives, show an error instead of an infinite spinner.
  // `isReady`/`failed` are reset by whoever bumps `reloadToken` (the retry button), not here.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isReadyRef.current) setFailed(true);
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [reloadToken]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "apexrn:ready") {
        setIsReady(true);
        setFailed(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Theme changes are messages, not reloads.
  useEffect(() => {
    if (!isReady) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "apexrn:theme", mode: theme }, window.location.origin);
  }, [theme, isReady]);

  // Control changes: debounced postMessage so a dragged slider doesn't flood the iframe.
  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "apexrn:playgroundProps", component: slug, props: values },
        window.location.origin,
      );
    }, PROPS_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [values, isReady, slug]);

  const iframeSrc = `/lab/index.html?embed=1#playground:${slug}:${theme}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center border-2 border-[var(--hairline)]">
          <button
            onClick={() => onThemeChange("light")}
            aria-pressed={theme === "light"}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              theme === "light" ? "bg-[var(--fg)] text-[var(--bg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <Sun size={13} /> Light
          </button>
          <button
            onClick={() => onThemeChange("dark")}
            aria-pressed={theme === "dark"}
            className={`flex items-center gap-1.5 border-l-2 border-[var(--hairline)] px-3 py-1.5 text-xs font-medium transition-colors ${
              theme === "dark" ? "bg-[var(--fg)] text-[var(--bg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <Moon size={13} /> Dark
          </button>
        </div>
      </div>

      <div className="edge-block relative overflow-hidden bg-[var(--surface)]" style={{ minHeight: 360 }}>
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-mono text-[11px] uppercase tracking-wide text-[var(--coral)]">
              Preview failed to load
            </p>
            <p className="max-w-[260px] text-xs text-[var(--fg-muted)]">
              The embedded Lab didn&rsquo;t respond in time. Try refreshing the preview.
            </p>
            <button
              onClick={() => {
                setIsReady(false);
                setFailed(false);
                setReloadToken((n) => n + 1);
              }}
              className="flex items-center gap-1.5 border-2 border-[var(--hairline)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] transition-colors hover:border-[var(--fg)]"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        ) : (
          <>
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                <div className="edge-block-sm flex h-9 w-9 items-center justify-center bg-[var(--coral)] font-display text-sm font-bold text-[var(--coral-ink)]">
                  N
                </div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-[var(--fg-muted)]">
                  ApexRN Lab — booting
                </p>
              </div>
            )}
            <iframe
              key={reloadToken}
              ref={iframeRef}
              data-apexrn-lab
              src={iframeSrc}
              title={`ApexRN ${slug} playground preview, running in the web build of the demo Lab`}
              className="h-[400px] w-full border-0"
              style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s ease" }}
            />
          </>
        )}
      </div>

      <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
        <strong className="text-[var(--fg)]">Known limits:</strong> this is a web render of the real, compiled{" "}
        <code>@apexrn/ui</code> build via react-native-web. Haptics, native <code>Modal</code> window behavior, and
        some native gestures differ on an actual device.
      </p>
    </div>
  );
}
