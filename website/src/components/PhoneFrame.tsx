"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSiteTheme } from "@/context/ThemeContext";

interface PhoneFrameProps {
  /** Lab hash route, e.g. "showcase", "button", "card". */
  screen?: string;
  className?: string;
  /** Skip the lazy-mount gate and load immediately (used once above the fold). */
  eager?: boolean;
  /** Intrinsic width in px; scales down on narrow viewports via max-width, never via transform. */
  maxWidth?: number;
}

export default function PhoneFrame({ screen = "showcase", className = "", eager = false, maxWidth = 320 }: PhoneFrameProps) {
  const { theme } = useSiteTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [shouldMount, setShouldMount] = useState(eager);
  const [isReady, setIsReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (eager) return;
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
  }, [eager]);

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
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const send = (reduced: boolean) =>
      iframeRef.current?.contentWindow?.postMessage(
        { type: "apexrn:reducedMotion", value: reduced },
        window.location.origin,
      );
    send(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => send(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "apexrn:theme", mode: theme }, window.location.origin);
  }, [theme, isReady]);

  const iframeSrc = `/lab/index.html?embed=1#${screen}:${theme}`;

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto ${className}`}
      style={{ width: "100%", maxWidth }}
    >
      <div
        className="relative w-full rounded-[10%] border-[3px] border-[#151517] bg-[#050505] p-2 shadow-[8px_8px_0_0_var(--edge)]"
        style={{ aspectRatio: "9 / 19.5" }}
      >
        <div className="absolute -left-[3px] top-[12%] h-[4%] w-[3px] rounded-l bg-[#151517]" />
        <div className="absolute -left-[3px] top-[18%] h-[5%] w-[3px] rounded-l bg-[#151517]" />
        <div className="absolute -right-[3px] top-[16%] h-[6%] w-[3px] rounded-r bg-[#151517]" />

        <div className="relative h-full w-full overflow-hidden rounded-[8%] bg-[#0a0a0a]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center pt-[3%]">
            <div className="h-[3%] w-[28%] rounded-full bg-black" />
          </div>

          <AnimatePresence>
            {(!shouldMount || !isReady) && (
              <motion.div
                key="skeleton"
                initial={false}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] p-6 text-center"
              >
                <motion.div
                  className="edge-block-sm flex h-10 w-10 items-center justify-center bg-[var(--coral)] font-display text-base font-bold text-[var(--coral-ink)]"
                  animate={prefersReducedMotion ? undefined : { opacity: [1, 0.55, 1] }}
                  transition={prefersReducedMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  N
                </motion.div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-white/50">
                  ApexRN Lab — booting
                </p>
                <p className="max-w-[220px] text-xs leading-relaxed text-white/70">
                  A live, compiled preview of the <code className="font-mono">{screen}</code> screen loads here once
                  the page settles.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {shouldMount && (
            <motion.iframe
              ref={iframeRef}
              data-apexrn-lab
              src={iframeSrc}
              title={`ApexRN ${screen} component preview, running in the web build of the demo Lab`}
              className="h-full w-full border-0"
              loading={eager ? "eager" : "lazy"}
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.03 }}
              animate={isReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: prefersReducedMotion ? 1 : 1.03 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          )}

          <div className="pointer-events-none absolute bottom-[1.5%] inset-x-0 z-30 flex justify-center">
            <div className="h-[0.5%] w-[35%] rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
