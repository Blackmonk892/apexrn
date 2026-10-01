import type { MetadataRoute } from "next";
import { getAllComponents } from "@/lib/docs-data";

export const dynamic = "force-static";

// Static export has no request-time host, so the absolute base must come from the
// deploy environment. Falls back to a placeholder (and warns at build time) rather
// than guessing a real domain.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-apexrn-site.invalid";

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "[sitemap] NEXT_PUBLIC_SITE_URL is not set — sitemap.xml will use a placeholder domain. " +
      "Set it before deploying so the sitemap points at the real site.",
  );
}

const STATIC_ROUTES = ["/", "/docs", "/docs/introduction", "/docs/installation", "/docs/theming", "/docs/components", "/playground"];

export default function sitemap(): MetadataRoute.Sitemap {
  const components = getAllComponents();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const componentEntries: MetadataRoute.Sitemap = components.flatMap((c) => [
    { url: `${SITE_URL}/docs/components/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${SITE_URL}/playground/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.5 },
  ]);

  return [...staticEntries, ...componentEntries];
}
