import type { NextConfig } from "next";

// NEXT_PUBLIC_BASE_PATH is only set when served from a subpath; NEXT_PUBLIC_SITE_URL feeds the sitemap.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};

export default nextConfig;
