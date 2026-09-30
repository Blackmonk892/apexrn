import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/docs/Breadcrumbs";
import TableOfContents, { type TocEntry } from "@/components/docs/TableOfContents";
import PrevNextNav from "@/components/docs/PrevNextNav";
import RelatedComponents from "@/components/docs/RelatedComponents";
import CodeBlock from "@/components/docs/CodeBlock";
import PropsTable from "@/components/docs/PropsTable";
import ComponentPreview from "@/components/docs/ComponentPreview";
import {
  getAllComponents,
  getComponentBySlug,
  getAdjacentComponents,
  getRelatedComponents,
} from "@/lib/docs-data";
import { getPlaygroundComponent } from "@/lib/playground-config";

export function generateStaticParams() {
  return getAllComponents().map((c) => ({ component: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ component: string }> }) {
  const { component: slug } = await params;
  const component = getComponentBySlug(slug);
  if (!component) return {};
  return {
    title: `${component.name} — ApexRN docs`,
    description: component.description,
  };
}

const TOC: TocEntry[] = [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
  { id: "variants", label: "Variants" },
  { id: "props", label: "API / Props" },
  { id: "composition", label: "Composition" },
  { id: "accessibility", label: "Accessibility" },
  { id: "related", label: "Related" },
];

export default async function ComponentPage({ params }: { params: Promise<{ component: string }> }) {
  const { component: slug } = await params;
  const component = getComponentBySlug(slug);
  if (!component) notFound();

  const { prev, next } = getAdjacentComponents(component.slug);
  const related = getRelatedComponents(component.slug);
  const playground = getPlaygroundComponent(component.slug);
  const toc = TOC.filter((entry) => {
    if (entry.id === "variants") return component.variants.length > 0;
    if (entry.id === "composition") return component.composition.length > 0;
    if (entry.id === "accessibility") return component.accessibility.length > 0;
    if (entry.id === "related") return related.length > 0;
    return true;
  });

  const fallbackNote =
    component.labScreenIsFallback && component.labScreen
      ? `No standalone Lab specimen exists yet for ${component.name}; this preview shows the closest real specimen (${component.labScreen}) instead of a fake render.`
      : undefined;

  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1 max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "Docs", href: "/docs" },
            { label: "Components", href: "/docs/components" },
            { label: component.name },
          ]}
        />

        <div className="mt-3 flex items-center gap-2">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{component.name}</h1>
          <span className="font-mono text-xs text-[var(--fg-muted)]">{component.group}</span>
        </div>
        <p className="mt-3 max-w-xl text-[var(--fg-muted)]">{component.description}</p>

        <section id="preview" className="mt-8">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">Preview</h2>
            {playground && (
              <Link
                href={`/playground/${component.slug}`}
                className="font-mono text-xs text-[var(--coral)] underline decoration-[var(--hairline)] hover:decoration-[var(--coral)]"
              >
                Try it in the Playground →
              </Link>
            )}
          </div>
          <div className="mt-3">
            {component.labScreen ? (
              <ComponentPreview
                screen={component.labScreen}
                isFallback={component.labScreenIsFallback}
                fallbackNote={fallbackNote}
              />
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">No live specimen is wired up for this entry yet.</p>
            )}
          </div>
        </section>

        <section id="installation" className="mt-10">
          <h2 className="font-display text-lg font-semibold">Installation</h2>
          <CodeBlock code={`npx apexrn add ${component.slug}`} filename="terminal" className="mt-3" />
          {(component.dependencies.length > 0 || component.registryDependencies.length > 0) && (
            <p className="mt-3 text-sm text-[var(--fg-muted)]">
              {component.registryDependencies.length > 0 && (
                <>
                  Pulls in <code>{component.registryDependencies.join(", ")}</code> from the registry automatically.{" "}
                </>
              )}
              {component.dependencies.length > 0 && (
                <>
                  Peer packages: <code>{component.dependencies.join(", ")}</code> (installed via{" "}
                  <code>npx expo install</code>).
                </>
              )}
            </p>
          )}
        </section>

        <section id="usage" className="mt-10">
          <h2 className="font-display text-lg font-semibold">Usage</h2>
          {component.usage ? (
            <>
              <CodeBlock code={component.usage.code} filename={`${component.name}Demo.tsx`} className="mt-3" />
              {component.usage.note && (
                <p className="mt-3 text-sm text-[var(--fg-muted)]" dangerouslySetInnerHTML={{ __html: component.usage.note }} />
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--fg-muted)]">No usage snippet found in docs/components.md for this component.</p>
          )}
          <p className="mt-3 text-xs text-[var(--fg-muted)]">
            The full states, sizes and both themes are also shown live in the preview above — interact with it
            directly rather than reading a second, separately-maintained example.
          </p>
        </section>

        {component.variants.length > 0 && (
          <section id="variants" className="mt-10">
            <h2 className="font-display text-lg font-semibold">Variants</h2>
            <div className="mt-3 flex flex-col gap-3">
              {component.variants.map((v) => (
                <div key={v.prop}>
                  <p className="font-mono text-xs text-[var(--fg-muted)]">{v.prop}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {v.options.map((opt) => (
                      <span key={opt} className="border border-[var(--hairline)] px-2 py-0.5 font-mono text-xs">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="props" className="mt-10">
          <h2 className="font-display text-lg font-semibold">API / Props</h2>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Extracted from <code>{component.name}Props</code> in <code>packages/ui/components/{component.slug}.tsx</code>.
          </p>
          <div className="mt-3">
            <PropsTable props={component.props} />
          </div>
        </section>

        {component.composition.length > 0 && (
          <section id="composition" className="mt-10">
            <h2 className="font-display text-lg font-semibold">Composition</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              {component.name} is a compound component; these parts compose with it and throw a clear error when used
              outside it.
            </p>
            <div className="mt-4 flex flex-col gap-6">
              {component.composition.map((part) => (
                <div key={part.name}>
                  <h3 className="font-mono text-sm font-semibold">{part.name}</h3>
                  <div className="mt-2">
                    <PropsTable props={part.props} />
                  </div>
                </div>
              ))}
            </div>
            {component.helpers.length > 0 && (
              <p className="mt-4 text-sm text-[var(--fg-muted)]">
                Also exported: <code>{component.helpers.join(", ")}</code>.
              </p>
            )}
          </section>
        )}

        {component.accessibility.length > 0 && (
          <section id="accessibility" className="mt-10">
            <h2 className="font-display text-lg font-semibold">Accessibility</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Detected directly in the component source (not asserted):
            </p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-[var(--fg-muted)]">
              {component.accessibility.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="text-[var(--coral)]">✓</span> {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section id="related" className="mt-10">
            <h2 className="font-display text-lg font-semibold">Related components</h2>
            <div className="mt-3">
              <RelatedComponents components={related} />
            </div>
          </section>
        )}

        <PrevNextNav prev={prev} next={next} />

        <p className="mt-6 text-xs text-[var(--fg-muted)]">
          Plain-text mirror for AI agents:{" "}
          <Link href={`/docs/components/${component.slug}/llms.txt`} className="underline decoration-[var(--hairline)] hover:text-[var(--fg)]">
            /docs/components/{component.slug}/llms.txt
          </Link>
        </p>
      </article>
      <TableOfContents entries={toc} />
    </div>
  );
}
