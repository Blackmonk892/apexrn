import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getPlaygroundComponents } from "@/lib/playground-config";

export const metadata: Metadata = {
  title: "Playground — ApexRN docs",
  description: "Try real ApexRN components live, with controls generated from their actual prop API.",
};

export default function PlaygroundIndexPage() {
  const components = getPlaygroundComponents();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Playground</h1>
      <p className="mt-3 text-[var(--fg-muted)]">
        Pick a component to try it live — the real, compiled <code>@apexrn/ui</code> build running in the Lab, with
        controls built from its actual props. Change a control and the preview and code update together.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {components.map(({ component }) => (
          <Link
            key={component.slug}
            href={`/playground/${component.slug}`}
            className="edge-block block bg-[var(--surface)] p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold">{component.name}</span>
              <span className="font-mono text-xs text-[var(--fg-muted)]">{component.group}</span>
            </div>
            <p className="mt-1.5 text-sm text-[var(--fg-muted)]">{component.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
