import type { Node, Root } from "fumadocs-core/page-tree";
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

const COMPONENTS_INDEX = "/docs/components";

function withoutComponentsIndex(nodes: Node[]): Node[] {
  return nodes
    .filter((n) => !(n.type === "page" && n.url === COMPONENTS_INDEX))
    .map((n) => (n.type === "folder" ? { ...n, index: n.index?.url === COMPONENTS_INDEX ? undefined : n.index, children: withoutComponentsIndex(n.children) } : n));
}

/** The sidebar tree. The components index stays reachable from the top bar, not from the list. */
export function sidebarTree(): Root {
  const tree = source.getPageTree();
  return { ...tree, children: withoutComponentsIndex(tree.children) };
}
