import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/docs/Breadcrumbs";
import { getGroups, getAllComponents } from "@/lib/docs-data";

export const metadata = {
  title: "Components — ApexRN docs",
  description: "Every ApexRN component, grouped by Actions, Display, Feedback, Forms, Overlays, Navigation and Primitive.",
};

export default function ComponentsIndexPage() {
  const groups = getGroups();
  const components = getAllComponents();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Breadcrumbs items={[{ label: "Docs", href: "/docs" }, { label: "Components" }]} />
        <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">Components</h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-muted)]">
          {components.length} components across {groups.length} groups — generated from the real registry, so a page
          exists only for a component that actually ships.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.name}>
          <h2 className="font-display text-lg font-semibold">{group.name}</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.components.map((slug) => {
              const component = components.find((c) => c.slug === slug);
              if (!component) return null;
              return (
                <Link
                  key={slug}
                  href={`/docs/components/${slug}`}
                  className="edge-block-sm block bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--surface-raised)]"
                >
                  <p className="font-display text-sm font-semibold">{component.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">{component.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
