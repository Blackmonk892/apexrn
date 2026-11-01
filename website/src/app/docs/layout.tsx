import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { NavItem } from "@/components/sidebar-item";
import { ThemeControls } from "@/components/theme-controls";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  const base = baseOptions();
  return (
    <DocsLayout
      {...base}
      tree={source.getPageTree()}
      nav={{ ...base.nav, mode: "top" }}
      tabMode="sidebar"
      tabs={false}
      sidebar={{
        collapsible: false,
        defaultOpenLevel: 1,
        components: { Item: NavItem },
        footer: (
          <div className="ax-sidebar-theme">
            <ThemeControls />
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
