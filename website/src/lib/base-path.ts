/** Prefix for URLs that bypass next/link (iframes, fetched assets). Empty unless the site is served from a subpath. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SHOWCASE_URL = `${BASE_PATH}/preview/?view=showcase`;
