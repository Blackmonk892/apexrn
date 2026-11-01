import type { ReactNode } from "react";
import { DocsMobileNav, DocsSidebar } from "@/components/DocsSidebar";
import { Toc } from "@/components/Toc";
import { getParts } from "@/lib/parts";
import "./docs.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const parts = getParts().map(({ slug, name, number }) => ({ slug, name, number }));
  return (
    <div className="page docs-shell">
      <DocsSidebar parts={parts} />
      <div className="docs-content">
        <DocsMobileNav parts={parts} />
        <article id="docs-article" className="docs-article">
          {children}
        </article>
      </div>
      <Toc />
    </div>
  );
}
