"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Primitive = string | number | boolean;

/**
 * Deep-linkable UI state (theme, variant, size, …) synced to the page's query string.
 *
 * Mirrors the Lab's own `#<screen>:<theme>` hash convention conceptually — the same vocabulary
 * (e.g. "light"/"dark") round-trips between this query string and the iframe's hash — but lives in
 * `?query=params` rather than `#hash` so it never collides with on-page `#id` anchors (table of
 * contents links, etc). Uses raw `history.pushState`/`replaceState`, not `next/navigation`, so
 * updates never trigger a route re-render; a `popstate` listener restores state on back/forward.
 */
export function useQueryState<T extends Record<string, Primitive>>(
  defaults: T,
  decode: (params: URLSearchParams) => Partial<T>,
) {
  const [state, setState] = useState<T>(defaults);
  const decodeRef = useRef(decode);
  useEffect(() => {
    decodeRef.current = decode;
  }, [decode]);

  const readFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    setState((prev) => ({ ...prev, ...decodeRef.current(params) }));
  }, []);

  useEffect(() => {
    readFromUrl();
    window.addEventListener("popstate", readFromUrl);
    return () => window.removeEventListener("popstate", readFromUrl);
  }, [readFromUrl]);

  const update = useCallback((patch: Partial<T>, opts?: { push?: boolean }) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      const url = new URL(window.location.href);
      for (const [key, value] of Object.entries(next)) {
        url.searchParams.set(key, String(value));
      }
      window.history[opts?.push ? "pushState" : "replaceState"](null, "", url);
      return next;
    });
  }, []);

  return [state, update] as const;
}
