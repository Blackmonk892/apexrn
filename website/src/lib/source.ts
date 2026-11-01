import { loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";

const docs = defineDocs({
  dir: "content/docs",
  docs: { postprocess: { includeProcessedMarkdown: true } },
});

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

/** The text the "Copy page" button fetches, a static file per page. */
export function markdownPath(slugs: string[]): string {
  return slugs.length ? `/md/docs/${slugs.join("/")}.md` : "/md/docs.md";
}
