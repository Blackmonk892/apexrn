"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { usePreset } from "@/lib/preset";

type Mode = "light" | "dark";
const MIN_HEIGHT = 320;

function exampleUrl(slug: string, id: string, mode: Mode, preset: string) {
  return `${BASE_PATH}/preview/index.html?theme=${mode}&preset=${preset}#/example/${slug}/${id}`;
}

export function ComponentPreview({ slug, id, title, children }: { slug: string; id: string; title: string; children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const preset = usePreset();
  const siteMode: Mode = resolvedTheme === "dark" ? "dark" : "light";
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [override, setOverride] = useState<Mode | null>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [error, setError] = useState<string | null>(null);
  const [shotFailed, setShotFailed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const initial = useRef<{ mode: Mode; preset: string } | null>(null);

  const mode = override ?? siteMode;
  const latest = useRef({ mode, preset });
  useEffect(() => {
    latest.current = { mode, preset };
  });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const send = useCallback((message: object) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== frameRef.current?.contentWindow) return;
      const d = e.data as { type?: string; height?: number; message?: string } | null;
      if (d?.type === "apexrn:ready") {
        setReady(true);
        send({ type: "apexrn:theme", mode: latest.current.mode });
        send({ type: "apexrn:preset", preset: latest.current.preset });
      } else if (d?.type === "apexrn:resize" && typeof d.height === "number") {
        setHeight(Math.max(MIN_HEIGHT, Math.ceil(d.height)));
      } else if (d?.type === "apexrn:error") {
        setError(d.message ?? "The example failed to render.");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  useEffect(() => {
    if (ready) send({ type: "apexrn:theme", mode });
  }, [ready, mode, send]);
  useEffect(() => {
    if (ready) send({ type: "apexrn:preset", preset });
  }, [ready, preset, send]);

  if (visible && !initial.current) initial.current = { mode, preset };
  const src = initial.current ? exampleUrl(slug, id, initial.current.mode, initial.current.preset) : undefined;
  const openUrl = exampleUrl(slug, id, mode, preset);

  return (
    <div className="ax-preview" ref={boxRef}>
      <div className="ax-preview-bar">
        <div role="tablist" aria-label={`${title} example`} className="ax-tabs">
          {(["preview", "code"] as const).map((t) => (
            <button key={t} type="button" role="tab" id={`${slug}-${id}-tab-${t}`} aria-selected={tab === t} aria-controls={`${slug}-${id}-panel-${t}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="ax-preview-actions">
          <button type="button" className="ax-mini" aria-pressed={mode === "dark"} onClick={() => setOverride(mode === "dark" ? "light" : "dark")}>
            {mode === "dark" ? "Dark" : "Light"}
          </button>
          <a className="ax-mini" href={openUrl} target="_blank" rel="noopener noreferrer">
            Open ↗<span className="sr-only"> {title} example in a new tab</span>
          </a>
        </div>
      </div>
      <div role="tabpanel" id={`${slug}-${id}-panel-preview`} aria-labelledby={`${slug}-${id}-tab-preview`} hidden={tab !== "preview"} className="ax-preview-stage" data-box={mode} data-ready={ready || undefined} style={{ minHeight: MIN_HEIGHT }}>
        {!shotFailed && (
          // eslint-disable-next-line @next/next/no-img-element -- static export, fixed dimensions
          <img className="ax-shot" src={`${BASE_PATH}/previews/${slug}/${id}-${mode}.png`} width={720} height={MIN_HEIGHT} alt="" aria-hidden="true" onError={() => setShotFailed(true)} />
        )}
        {src && <iframe ref={frameRef} className="ax-frame" title={`${title} example`} src={src} loading="lazy" style={{ height }} />}
        {error && <p className="ax-preview-error" role="alert">{error}</p>}
      </div>
      <div role="tabpanel" id={`${slug}-${id}-panel-code`} aria-labelledby={`${slug}-${id}-tab-code`} hidden={tab !== "code"} className="ax-preview-code">
        {children}
      </div>
    </div>
  );
}
