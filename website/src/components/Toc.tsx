"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** On-page contents, read from the h2/h3 ids in the article. Shown at 1280px and up. */
export function Toc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // Read after paint so the article's headings exist; also keeps setState out of the effect body.
    const frame = requestAnimationFrame(() => {
      const found = Array.from(document.querySelectorAll<HTMLHeadingElement>("#docs-article h2[id], #docs-article h3[id]"));
      setHeadings(found.map((h) => ({ id: h.id, text: h.textContent ?? "", level: h.tagName === "H2" ? 2 : 3 })));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  if (!headings.length) return <aside className="docs-toc" aria-hidden="true" />;
  return (
    <aside className="docs-toc">
      <nav aria-label="On this page">
        <p className="mono-label docs-nav-heading">On this page</p>
        <ul className="docs-nav-list">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? 12 : 0 }}>
              <a href={`#${h.id}`} className="docs-nav-link">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
