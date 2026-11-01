import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

export const dynamic = "force-static";

// Static export: the index is written to out/api/search at build and queried in the browser.
export const { staticGET: GET } = createFromSource(source);
