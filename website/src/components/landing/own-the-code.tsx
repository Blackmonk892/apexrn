import { highlight } from "fumadocs-core/highlight";
import { captureCommand, captureFiles, captureOutput, drawerExcerpt } from "./data";

const EXCERPT_FROM = 36;
const EXCERPT_TO = 62;
const FILE = "components/apexrn/drawer.tsx";

interface TreeNode {
  name: string;
  written?: boolean;
  children?: TreeNode[];
}

function buildTree(): TreeNode[] {
  const root: TreeNode = { name: "", children: [] };
  for (const file of captureFiles) {
    let node = root;
    const segments = file.path.split("/");
    segments.forEach((segment, i) => {
      const last = i === segments.length - 1;
      node.children ??= [];
      let next = node.children.find((c) => c.name === segment);
      if (!next) {
        next = last ? { name: segment, written: file.written } : { name: segment, children: [] };
        node.children.push(next);
      }
      node = next;
    });
  }
  return root.children ?? [];
}

function Tree({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul>
      {nodes.map((n) => (
        <li key={n.name}>
          <span className="lp-tree-name" data-written={n.written || undefined} translate="no">
            {n.name}
            {n.children ? "/" : ""}
          </span>
          {n.children ? <Tree nodes={n.children} /> : null}
        </li>
      ))}
    </ul>
  );
}

export async function OwnTheCode() {
  const code = await highlight(drawerExcerpt(EXCERPT_FROM, EXCERPT_TO), {
    lang: "tsx",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
  return (
    <div className="lp-code-grid">
      <figure className="lp-terminal">
        <figcaption className="lp-label">Terminal</figcaption>
        <pre>
          <code translate="no">
            <span className="lp-prompt">$ </span>
            {captureCommand}
            {"\n"}
            {captureOutput}
          </code>
        </pre>
      </figure>
      <div className="lp-code-side">
        <figure className="lp-tree">
          <figcaption className="lp-label">Files in your project, + written by this command</figcaption>
          <Tree nodes={buildTree()} />
        </figure>
        <figure className="lp-source">
          <figcaption className="lp-label">
            {FILE}, lines {EXCERPT_FROM} to {EXCERPT_TO}
          </figcaption>
          <div className="lp-source-code" style={{ counterReset: `line ${EXCERPT_FROM - 1}` }} translate="no">
            {code}
          </div>
        </figure>
      </div>
    </div>
  );
}
