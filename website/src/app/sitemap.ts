import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export const dynamic = "force-static";

// Static export has no request-time host, so the absolute base comes from the deploy environment.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-apexrn-site.invalid";

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn("[sitemap] NEXT_PUBLIC_SITE_URL is not set, so sitemap.xml uses a placeholder domain.");
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...source.getPages().map((page) => ({
      url: `${SITE_URL}${page.url}`,
      changeFrequency: "monthly" as const,
      priority: page.slugs.length <= 1 ? 0.7 : 0.6,
    })),
  ];
}
