"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { PlaygroundComponent } from "@/lib/playground-config";
import { generatePlaygroundCode, type PlaygroundValues } from "@/lib/playground-codegen";
import PlaygroundPreview from "./PlaygroundPreview";
import PlaygroundControls from "./PlaygroundControls";
import CodeBlock from "@/components/docs/CodeBlock";

function defaultsOf(pc: PlaygroundComponent): PlaygroundValues {
  const values: PlaygroundValues = {};
  for (const control of pc.controls) values[control.prop] = control.default;
  return values;
}

export default function PlaygroundClient({ pc }: { pc: PlaygroundComponent }) {
  const [values, setValues] = useState<PlaygroundValues>(() => defaultsOf(pc));

  const handleChange = useCallback((prop: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [prop]: value }));
  }, []);

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
          <PlaygroundPreview slug={pc.component.slug} values={values} />
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
