"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { useDismissableOverlay } from "@/lib/use-dismissable-overlay";

interface PagefindResult {
  data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }>;
}
interface Pagefind {
  search: (q: string) => Promise<{ results: PagefindResult[] }>;
}
interface Hit {
  url: string;
  title: string;
  excerpt: string;
}

let pagefindPromise: Promise<Pagefind> | null = null;

/** The index only exists after `next build` + postbuild; in dev the import fails and we say so. */
function loadPagefind(): Promise<Pagefind> {
  pagefindPromise ??= import(/* webpackIgnore: true */ `${BASE_PATH}/pagefind/pagefind.js`) as Promise<Pagefind>;
  return pagefindPromise;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState<"idle" | "unavailable">("idle");

  useDismissableOverlay(open, onClose, panelRef);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) return;
    let cancelled = false;
    (async () => {
      try {
        const pf = await loadPagefind();
        const found = await pf.search(query);
        const top = await Promise.all(found.results.slice(0, 8).map((r) => r.data()));
        if (cancelled) return;
        setStatus("idle");
        setHits(top.map((d) => ({ url: d.url, title: d.meta.title ?? d.url, excerpt: d.excerpt })));
      } catch {
        if (cancelled) return;
        pagefindPromise = null;
        setStatus("unavailable");
        setHits([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, open]);

  if (!open) return null;
  const shown = query.trim() ? hits : [];

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Search the docs">
      <div ref={panelRef} className="page" style={{ paddingTop: 24, paddingBottom: 48, maxWidth: 760, marginLeft: 0 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <label htmlFor="site-search" className="sr-only">
            Search
          </label>
          <input
            id="site-search"
            ref={inputRef}
            className="search-input"
            type="search"
            placeholder="Search parts and docs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="button" className="btn mono-label" onClick={onClose}>
            Close
          </button>
        </div>
        {status === "unavailable" && (
          <p className="t-small" style={{ color: "var(--ink-muted)" }}>
            The search index is created by a production build. Run next build to use search.
          </p>
        )}
        {query.trim() && status === "idle" && shown.length === 0 && (
          <p className="t-small" style={{ color: "var(--ink-muted)" }}>
            No results for &ldquo;{query}&rdquo;.
          </p>
        )}
        <div role="list">
          {shown.map((h) => (
            <a key={h.url} role="listitem" className="search-result" href={h.url} onClick={onClose}>
              <strong>{h.title}</strong>
              <span className="t-small" style={{ display: "block" }} dangerouslySetInnerHTML={{ __html: h.excerpt }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
