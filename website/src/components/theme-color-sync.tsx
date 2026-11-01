"use client";

import { useEffect } from "react";

// theme-color has to follow the class-based theme and the preset, which media queries cannot see.
export function ThemeColorSync() {
  useEffect(() => {
    const root = document.documentElement;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const apply = () => {
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = getComputedStyle(root).getPropertyValue("--ax-bg").trim() || "#FFFFFF";
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-preset"] });
    return () => observer.disconnect();
  }, []);
  return null;
}
