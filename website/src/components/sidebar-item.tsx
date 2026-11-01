"use client";

import { SidebarItem } from "fumadocs-ui/components/sidebar/base";
import { usePathname } from "fumadocs-core/framework";
import type * as PageTree from "fumadocs-core/page-tree";
import parts from "@/generated/parts.json";

const numbers = new Map(parts.map((p) => [`/docs/components/${p.slug}`, p.number]));

export function NavItem({ item }: { item: PageTree.Item }) {
  const pathname = usePathname().replace(/\/$/, "");
  const number = numbers.get(item.url);
  return (
    <SidebarItem href={item.url} external={item.external} active={pathname === item.url} icon={item.icon}>
      {number && <span className="ax-part-number">{number}</span>}
      <span>{item.name}</span>
    </SidebarItem>
  );
}
