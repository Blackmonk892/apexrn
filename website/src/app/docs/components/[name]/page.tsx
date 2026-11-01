import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { ComponentPreview } from "@/components/ComponentPreview";
import { InstallBlock } from "@/components/InstallBlock";
import { MonoLabel } from "@/components/MonoLabel";
import { PropsTable } from "@/components/PropsTable";
import { baseProps, getControls } from "@/lib/controls";
import { getAdjacentComponents } from "@/lib/docs-data";
import { getPart, getParts } from "@/lib/parts";

interface Params {
  name: string;
}

export function generateStaticParams(): Params[] {
  return getParts().map((p) => ({ name: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const part = getPart((await params).name);
  if (!part) return {};
  return {
    title: `${part.name} (${part.number})`,
    description: `${part.description} Add it with ${part.addCommand}.`,
  };
}

export default async function ComponentPage({ params }: { params: Promise<Params> }) {
  const part = getPart((await params).name);
  if (!part) notFound();
  const c = part.component;
  const controls = getControls(c);
  const states = c.props.filter((p) => p.type === "boolean");
  const { prev, next } = getAdjacentComponents(c.slug);
  const partNo = (slug: string) => getPart(slug)?.number ?? "";

  return (
    <>
      <header className="spec-header">
        <MonoLabel as="p">{part.number}</MonoLabel>
        <h1 className="t-h2">{c.name}</h1>
        <p>{c.description}</p>
        <InstallBlock command={part.addCommand} />
        {c.registryDependencies.length > 0 && (
          <div>
            <MonoLabel as="p" muted>
              Ships with:
            </MonoLabel>
            <ul className="ships-with t-small code">
              {c.registryDependencies.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <section>
        <h2 className="t-h3" id="preview">
          Preview
        </h2>
        <p className="t-small">The real component, running in the same web runtime as the landing page.</p>
        <ComponentPreview component={c.name} title={c.name} controls={controls} base={baseProps(c)} />
      </section>

      <section>
        <h2 className="t-h3" id="usage">
          Usage
        </h2>
        {c.usage ? (
          <>
            {c.usage.note && <p dangerouslySetInnerHTML={{ __html: c.usage.note }} />}
            <div className="code-wrap">
              <CodeBlock code={c.usage.code} copy />
            </div>
          </>
        ) : (
          <p>
            No usage snippet yet. Import <code>{c.name}</code> from your <code>components/apexrn</code> barrel.
          </p>
        )}
      </section>

      <section>
        <h2 className="t-h3" id="props">
          Props
        </h2>
        <p className="t-small">Props marked * are required.</p>
        <PropsTable props={c.props} caption={`${c.name} props`} />
        {c.composition.map((sub) => (
          <div key={sub.name}>
            <h3 className="t-h3" id={`props-${sub.name.toLowerCase()}`}>
              {sub.name}
            </h3>
            <PropsTable props={sub.props} caption={`${sub.name} props`} />
          </div>
        ))}
      </section>

      <section>
        <h2 className="t-h3" id="variants">
          Variants
        </h2>
        {c.variants.length ? (
          <div className="table-scroll">
            <table className="ruled-table">
              <caption className="sr-only">{c.name} variant props and their options</caption>
              <thead>
                <tr>
                  <th scope="col" className="mono-label">Prop</th>
                  <th scope="col" className="mono-label">Options</th>
                </tr>
              </thead>
              <tbody>
                {c.variants.map((v) => (
                  <tr key={v.prop}>
                    <th scope="row" className="code">{v.prop}</th>
                    <td className="code">{v.options.join(" | ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>{c.name} has a single look. Restyle it by editing its source or the theme tokens.</p>
        )}
      </section>

      <section>
        <h2 className="t-h3" id="states">
          States
        </h2>
        {states.length ? (
          <div className="table-scroll">
            <table className="ruled-table">
              <caption className="sr-only">{c.name} boolean state props</caption>
              <thead>
                <tr>
                  <th scope="col" className="mono-label">Prop</th>
                  <th scope="col" className="mono-label">Default</th>
                  <th scope="col" className="mono-label">Effect</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s) => (
                  <tr key={s.name}>
                    <th scope="row" className="code">{s.name}</th>
                    <td className="code">{s.default ?? "false"}</td>
                    <td className="t-small">{s.description || "No description yet."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No boolean state props. Value and open state, where they exist, are in the props table above.</p>
        )}
      </section>

      <section>
        <h2 className="t-h3" id="accessibility">
          Accessibility
        </h2>
        {c.accessibility.length ? (
          <ul className="plain">
            {c.accessibility.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : (
          <p>No accessibility notes recorded for this part.</p>
        )}
      </section>

      <section>
        <h2 className="t-h3" id="limits">
          Known limits
        </h2>
        <p>
          Verified on Android emulator; iOS and device feel checked by hand.
          {c.labScreenIsFallback ? " This part has no dedicated test screen yet." : ""}
        </p>
      </section>

      <nav className="pager" aria-label="Previous and next part">
        {prev ? (
          <Link href={`/docs/components/${prev.slug}`}>
            <span className="mono-label">{partNo(prev.slug)}</span> {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/docs/components/${next.slug}`}>
            <span className="mono-label">{partNo(next.slug)}</span> {next.name}
          </Link>
        )}
      </nav>
    </>
  );
}
