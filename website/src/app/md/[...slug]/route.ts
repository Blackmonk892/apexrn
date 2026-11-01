import { notFound } from "next/navigation";
import { markdownPath, source } from "@/lib/source";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: markdownPath(page.slugs).split("/").slice(2) }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugs = slug[0] === "docs.md" ? [] : slug.slice(1).map((s) => s.replace(/\.md$/, ""));
  const page = source.getPage(slugs);
  if (!page) notFound();
  const text = await page.data.getText("processed");
  return new Response(`# ${page.data.title}\n\n${page.data.description ?? ""}\n\n${text}`, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
