"use client";

import { useEffect, useRef } from "react";
import { sendThemeTo } from "@/lib/site-theme";
import { Frame } from "./Frame";

interface PhoneFrameProps {
  /** Full iframe URL, already prefixed with the base path. */
  src: string;
  title: string;
  /** Follow the site-wide theme switch. Off for a phone driven by its own controls. */
  followSite?: boolean;
  /** Called when the preview reports ready, with the iframe window. */
  onReady?: (target: Window) => void;
  leaders?: { y: number; part: string; label: string }[];
}

/** Preview iframe in the 3px frame with the 6px hard shadow, optionally with leader lines to part labels. */
export function PhoneFrame({ src, title, followSite = true, onReady, leaders }: PhoneFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const frame = ref.current;
      if (!frame || e.source !== frame.contentWindow) return;
      if ((e.data as { type?: unknown } | null)?.type !== "apexrn:ready") return;
      if (followSite) sendThemeTo(frame);
      if (frame.contentWindow) readyRef.current?.(frame.contentWindow);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [followSite]);

  return (
    <div className="phone-wrap">
      <Frame shadow="phone" className="phone-frame">
        <iframe
          ref={ref}
          src={src}
          title={title}
          loading="lazy"
          {...(followSite ? { "data-apexrn-preview": "" } : {})}
        />
      </Frame>
      {leaders?.map((l) => (
        <div key={l.part} className="leader" style={{ top: `${l.y}%` }} aria-hidden="true">
          <span className="leader-line" />
          <span className="mono-label">
            {l.part} {l.label}
          </span>
        </div>
      ))}
    </div>
  );
}
