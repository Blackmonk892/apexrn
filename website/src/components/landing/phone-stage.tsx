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
  /** How far the line reaches into the phone, in px. */
  reach: number;
}

const FRAME_SRC = `${BASE_PATH}/preview/index.html?theme=light&preset=neo#/showcase`;

export function PhoneStage({ leaders }: { leaders: Leader[] }) {
  const { resolvedTheme } = useTheme();
  const preset = usePreset();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const latest = useRef({ mode, preset });

  useEffect(() => {
    latest.current = { mode, preset };
  });

  useEffect(() => {
    function send(message: object) {
      frame.current?.contentWindow?.postMessage(message, window.location.origin);
    }
    function onMessage(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow) return;
      if ((e.data as { type?: string } | null)?.type !== "apexrn:ready") return;
      setReady(true);
      send({ type: "apexrn:theme", mode: latest.current.mode });
      send({ type: "apexrn:preset", preset: latest.current.preset });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    frame.current?.contentWindow?.postMessage({ type: "apexrn:theme", mode }, window.location.origin);
  }, [ready, mode]);

  useEffect(() => {
    if (!ready) return;
    frame.current?.contentWindow?.postMessage({ type: "apexrn:preset", preset }, window.location.origin);
  }, [ready, preset]);

  return (
    <>
      <div className="lp-stage">
        <div className="lp-stage-inner">
          <div className="lp-phone" data-ready={ready || undefined}>
            {/* eslint-disable @next/next/no-img-element -- static export, fixed dimensions */}
            <img className="lp-shot lp-shot-light" src={`${BASE_PATH}/built-with/ref-inbox-light.png`} width={320} height={640} alt="" aria-hidden="true" />
            <img className="lp-shot lp-shot-dark" src={`${BASE_PATH}/built-with/ref-inbox-dark.png`} width={320} height={640} alt="" aria-hidden="true" />
            {/* eslint-enable @next/next/no-img-element */}
            <iframe ref={frame} className="lp-frame" title="ApexRN Inbox screen, running live" src={FRAME_SRC} />
          </div>
          <ul className="lp-leaders">
            {leaders.map((l) => (
              <li key={l.slug} className="lp-leader" data-side={l.side} style={{ top: `${l.top}%`, ["--reach" as string]: `${l.reach}px` }}>
                <Link href={`/docs/components/${l.slug}`} className="lp-leader-label">
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
          <li key={l.slug}>
            <Link href={`/docs/components/${l.slug}`}>
              <span className="lp-num">{l.number}</span>
              <span translate="no">{l.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
