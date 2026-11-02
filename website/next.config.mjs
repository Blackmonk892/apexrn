import { createMDX } from "fumadocs-mdx/next";

// NEXT_PUBLIC_BASE_PATH is only set when served from a subpath; NEXT_PUBLIC_SITE_URL feeds the sitemap.
const config = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default createMDX()(config);
