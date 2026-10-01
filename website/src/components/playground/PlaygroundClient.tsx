"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
import type { PlaygroundComponent } from "@/lib/playground-config";
import { generatePlaygroundCode, type PlaygroundValues } from "@/lib/playground-codegen";
import { useQueryState } from "@/lib/use-query-state";
import PlaygroundPreview from "./PlaygroundPreview";
import PlaygroundControls from "./PlaygroundControls";
import CodeBlock from "@/components/docs/CodeBlock";

type PlaygroundState = PlaygroundValues & { theme: "light" | "dark" };

function defaultsOf(pc: PlaygroundComponent): PlaygroundState {
  const values: PlaygroundState = { theme: "dark" };
  for (const control of pc.controls) values[control.prop] = control.default;
  return values;
}

export default function PlaygroundClient({ pc }: { pc: PlaygroundComponent }) {
  const defaults = useMemo(() => defaultsOf(pc), [pc]);

  // Only accept query values the current specimen actually supports — never forward an
  // out-of-range/unsupported combination to the Lab (see prompt6's error-handling contract).
  const decode = useCallback(
    (params: URLSearchParams): Partial<PlaygroundState> => {
      const out: Partial<PlaygroundState> = {};
      const theme = params.get("theme");
      if (theme === "light" || theme === "dark") out.theme = theme;
      for (const control of pc.controls) {
        const raw = params.get(control.prop);
        if (raw === null) continue;
        if (control.type === "select") {
          if (control.options?.includes(raw)) out[control.prop] = raw;
        } else if (control.type === "boolean") {
          if (raw === "true" || raw === "false") out[control.prop] = raw === "true";
        } else if (control.type === "range" && control.range) {
          const n = Number(raw);
          if (!Number.isNaN(n) && n >= control.range.min && n <= control.range.max) out[control.prop] = n;
        }
      }
      return out;
    },
    [pc],
  );

  const [state, updateState] = useQueryState(defaults, decode);
  const { theme, ...values } = state;

  const handleChange = useCallback(
    (prop: string, value: string | number | boolean) => {
      // Rapid control changes (slider drags) replace the URL in place; they shouldn't spam history.
      updateState({ [prop]: value } as Partial<PlaygroundState>);
    },
    [updateState],
  );

  const handleThemeChange = useCallback(
    (mode: "light" | "dark") => {
      // Theme is a deliberate, discrete choice — worth a back/forward step.
      updateState({ theme: mode }, { push: true });
    },
    [updateState],
  );

  const code = useMemo(() => generatePlaygroundCode(pc, values), [pc, values]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{pc.component.name}</h1>
        <Link
          href={`/docs/components/${pc.component.slug}`}
          className="font-mono text-xs text-[var(--fg-muted)] underline decoration-[var(--hairline)] hover:text-[var(--fg)]"
        >
          Full docs →
        </Link>
      </div>
      <p className="mt-2 max-w-xl text-[var(--fg-muted)]">{pc.component.description}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <PlaygroundPreview
            slug={pc.component.slug}
            values={values}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
              Controls
            </h2>
            <div className="mt-3">
              <PlaygroundControls controls={pc.controls} values={values} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Code</h2>
        <CodeBlock code={code} filename={`${pc.component.name}Example.tsx`} className="mt-3" />
      </div>
    </div>
  );
}
