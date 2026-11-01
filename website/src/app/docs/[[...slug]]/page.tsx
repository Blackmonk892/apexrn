import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle, MarkdownCopyButton } from "fumadocs-ui/layouts/notebook/page";
import type { Metadata } from "next";
import { findNeighbour } from "fumadocs-core/page-tree";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import parts from "@/generated/parts.json";
import { markdownPath, sidebarTree, source } from "@/lib/source";

type Props = { params: Promise<{ slug?: string[] }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  const part = slug?.[0] === "components" ? parts.find((p) => p.slug === slug[1]) : undefined;

  const neighbours = findNeighbour(sidebarTree(), page.url);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      {part && <p className="ax-label ax-part-label">{part.number}</p>}
      <div className="ax-title-row">
        <DocsTitle>{page.data.title}</DocsTitle>
        <div className="ax-page-actions">
          <MarkdownCopyButton markdownUrl={markdownPath(page.slugs)}>Copy page</MarkdownCopyButton>
          {neighbours.previous && (
            <Link className="ax-page-nav" href={neighbours.previous.url} aria-label={`Previous: ${neighbours.previous.name}`}>
              <span aria-hidden="true">←</span>
            </Link>
          )}
          {neighbours.next && (
            <Link className="ax-page-nav" href={neighbours.next.url} aria-label={`Next: ${neighbours.next.name}`}>
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
