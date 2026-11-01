import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "This page does not exist.",
};

export default function NotFound() {
  return (
    <div className="page" style={{ padding: "64px var(--gutter)" }}>
      <p className="mono-label" data-muted="">
        404
      </p>
      <h1 className="t-h2" style={{ marginTop: 16 }}>
        This page does not exist.
      </h1>
      <p style={{ marginTop: 16, maxWidth: 520 }}>
        The address does not match a part, a docs page or anything else on this site.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/docs/components">Browse all parts</Link>
      </p>
    </div>
  );
}
