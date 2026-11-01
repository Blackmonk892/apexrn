import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ThemeControls } from "@/components/theme-controls";
import { GITHUB_URL } from "@/lib/site";

/** The top bar for every page. The landing page reuses it. */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: <span className="ax-wordmark" translate="no">ApexRN</span>, url: "/" },
    githubUrl: GITHUB_URL,
    links: [
      { text: "Docs", url: "/docs", active: "nested-url" },
      { text: "Components", url: "/docs/components", active: "nested-url" },
      { text: "GitHub", url: GITHUB_URL, external: true },
    ],
    slots: { themeSwitch: ThemeControls },
  };
}
