"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Control } from "@/lib/controls";
import { previewUrl } from "@/lib/site-theme";
import { useQueryState } from "@/lib/use-query-state";
import { PhoneFrame } from "./PhoneFrame";

interface Props {
  component: string;
  title: string;
  controls: Control[];
  base: Record<string, unknown>;
}

type Value = string | boolean;

/** Live preview iframe plus controls. Each change posts `apexrn:render`; the state lives in the URL query. */
export function ComponentPreview({ component, title, controls, base }: Props) {
  const defaults = Object.fromEntries(controls.map((c) => [c.name, c.initial])) as Record<string, Value>;
  const decode = useCallback(
    (params: URLSearchParams) => {
      const next: Record<string, Value> = {};
      for (const c of controls) {
        const raw = params.get(c.name);
        if (raw === null) continue;
        if (c.kind === "toggle") next[c.name] = raw === "true";
        else if (c.options.includes(raw)) next[c.name] = raw;
      }
      return next;
    },
    [controls],
  );
  const [state, update] = useQueryState<Record<string, Value>>(defaults, decode);

  const target = useRef<Window | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(() => {
    if (!target.current) return;
    setError(null);
    target.current.postMessage(
      { type: "apexrn:render", component, props: { ...base, ...state } },
      window.location.origin,
    );
  }, [component, base, state]);

  useEffect(() => {
    send();
  }, [send]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as { type?: string; message?: string } | null;
      if (data?.type === "apexrn:error" && e.source === target.current) setError(data.message ?? "Render failed.");
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const onReady = useCallback(
    (w: Window) => {
      target.current = w;
      send();
    },
    [send],
  );

  return (
    <div className="preview-grid">
      <PhoneFrame src={previewUrl("?embed=1")} title={`${title} live preview`} onReady={onReady} />
      <div className="preview-side">
        {controls.length ? (
          <div className="preview-controls" role="group" aria-label={`${title} preview controls`}>
            {controls.map((c) =>
              c.kind === "select" ? (
                <label key={c.name} className="control">
                  <span className="mono-label">{c.name}</span>
                  <select
                    className="control-field"
                    value={String(state[c.name])}
                    onChange={(e) => update({ [c.name]: e.target.value })}
                  >
                    {c.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label key={c.name} className="control control-toggle">
                  <input
                    type="checkbox"
                    checked={state[c.name] === true}
                    onChange={(e) => update({ [c.name]: e.target.checked })}
                  />
                  <span className="mono-label">{c.name}</span>
                </label>
              ),
            )}
          </div>
        ) : (
          <p className="t-small">This part has no variant or state props to switch. The preview shows its default render.</p>
        )}
        {error && (
          <p className="t-small" role="status">
            The preview could not render this part on its own: {error} Compound parts need the usage code below.
          </p>
        )}
      </div>
    </div>
  );
}
