"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { usePreset } from "@/lib/preset";

export interface Leader {
  slug: string;
  number: string;
  name: string;
  side: "left" | "right";
  /** Vertical position as a percentage of the phone height. */
  top: number;
}

const FRAME_SRC = `${BASE_PATH}/preview/index.html?theme=light&preset=neo#/showcase`;
const STILL = `${BASE_PATH}/landing/showcase`;
const RESUME_AFTER = 3000;
const FLASH_FOR = 900;
// `apexrn:ready` can arrive before the showcase installs its demo listener, so the start is re-sent;
// a repeated `running: true` is a no-op on the preview side.
const START_RETRIES = [0, 500, 1500];

export function PhoneStage({ leaders }: { leaders: Leader[] }) {
  const { resolvedTheme } = useTheme();
  const preset = usePreset();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  // Nothing is drawn over the screen; a hovered or flashed label asks the phone to outline its part instead.
  const [pointed, setPointed] = useState<string | null>(null);
  const highlight = pointed ?? flash;
  // The preview posts `apexrn:ready` once on mount. The iframe is in the static HTML, so it can
  // finish booting before React hydrates and attaches the listener; set src only after the
  // listener exists or the message is lost and the phone stays on the still forever.
  const latest = useRef({ mode, preset });
  const slugs = useRef(new Set<string>());
  const resume = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const held = useRef(false);

  useEffect(() => {
    latest.current = { mode, preset };
    slugs.current = new Set(leaders.map((l) => l.slug));
  });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const starts: ReturnType<typeof setTimeout>[] = [];
    function send(message: object) {
      frame.current?.contentWindow?.postMessage(message, window.location.origin);
    }
    function onMessage(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow) return;
      const data = e.data as { type?: string; part?: unknown } | null;
      if (data?.type === "apexrn:ready") {
        setReady(true);
        send({ type: "apexrn:theme", mode: latest.current.mode });
        send({ type: "apexrn:preset", preset: latest.current.preset });
        if (!reduced.matches) {
          for (const ms of START_RETRIES) {
            starts.push(setTimeout(() => !held.current && send({ type: "apexrn:demo-control", running: true }), ms));
          }
        }
      } else if (data?.type === "apexrn:demo-step" && typeof data.part === "string" && slugs.current.has(data.part)) {
        const slug = data.part;
        setFlash(slug);
        clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlash(null), FLASH_FOR);
      }
    }
    window.addEventListener("message", onMessage);
    if (frame.current) frame.current.src = FRAME_SRC;
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(resume.current);
      clearTimeout(flashTimer.current);
      starts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    frame.current?.contentWindow?.postMessage({ type: "apexrn:theme", mode }, window.location.origin);
  }, [ready, mode]);

  useEffect(() => {
    if (!ready) return;
    frame.current?.contentWindow?.postMessage({ type: "apexrn:preset", preset }, window.location.origin);
  }, [ready, preset]);

  useEffect(() => {
    if (!ready) return;
    frame.current?.contentWindow?.postMessage({ type: "apexrn:highlight", part: highlight }, window.location.origin);
  }, [ready, highlight]);

  const point = (slug: string) => ({
    onPointerEnter: () => setPointed(slug),
    onPointerLeave: () => setPointed(null),
    onFocus: () => setPointed(slug),
    onBlur: () => setPointed(null),
  });

  // The demo drives the phone by itself; a visitor reaching for it takes over until they leave.
  function hold() {
    held.current = true;
    clearTimeout(resume.current);
    frame.current?.contentWindow?.postMessage({ type: "apexrn:demo-control", running: false }, window.location.origin);
  }
  function release() {
    held.current = false;
    clearTimeout(resume.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    resume.current = setTimeout(() => {
      frame.current?.contentWindow?.postMessage({ type: "apexrn:demo-control", running: true }, window.location.origin);
    }, RESUME_AFTER);
  }

  return (
    <>
      <div className="lp-stage">
        <div className="lp-stage-inner">
          <div className="lp-phone" data-ready={ready || undefined} onPointerEnter={hold} onTouchStart={hold} onFocus={hold} onPointerLeave={release} onBlur={release}>
            {/* eslint-disable @next/next/no-img-element -- static export, fixed dimensions */}
            <img className="lp-shot lp-shot-light" src={`${STILL}-light.png`} width={390} height={844} alt="" aria-hidden="true" />
            <img className="lp-shot lp-shot-dark" src={`${STILL}-dark.png`} width={390} height={844} alt="" aria-hidden="true" />
            {/* eslint-enable @next/next/no-img-element */}
            <iframe ref={frame} className="lp-frame" title="ApexRN training-plan screen, running live" />
          </div>
          <ul className="lp-leaders">
            {leaders.map((l, i) => (
              <li
                key={l.slug}
                className="lp-leader"
                data-side={l.side}
                data-flash={flash === l.slug || undefined}
                style={{ top: `${l.top}%`, ["--i" as string]: i }}
              >
                <Link href={`/docs/components/${l.slug}`} className="lp-leader-label" {...point(l.slug)}>
                  <span className="lp-num">{l.number}</span>
                  <span className="lp-leader-name" translate="no">
                    {l.name}
                  </span>
                </Link>
                <span className="lp-leader-line" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="lp-leaderlist" aria-label="Parts on screen">
        {leaders.map((l) => (
          <li key={l.slug} data-flash={flash === l.slug || undefined}>
            <Link href={`/docs/components/${l.slug}`} {...point(l.slug)}>
              <span className="lp-num">{l.number}</span>
              <span translate="no">{l.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
