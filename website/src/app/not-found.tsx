import Link from "next/link";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata = {
  title: "Page not found — ApexRN",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <header className="w-full border-b-2 border-[var(--edge)]">
          <div className="mx-auto flex max-w-6xl items-center px-5 py-3 sm:px-8">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="edge-block-sm flex h-8 w-8 items-center justify-center bg-[var(--coral)] font-display text-sm font-bold text-[var(--coral-ink)]">
                N
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">ApexRN</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-24 sm:px-8">
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-[var(--coral)]">404</span>
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            This page doesn&apos;t exist.
          </h1>
          <p className="mt-4 max-w-md text-[var(--fg-muted)]">
            The route you followed doesn&apos;t match a component, docs page or anything else in ApexRN.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="edge-block-sm press-block bg-[var(--fg)] px-4 py-2.5 text-sm font-semibold text-[var(--bg)]">
              Back home
            </Link>
            <Link
              href="/docs/components"
              className="press-block border-2 border-[var(--hairline)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--edge)]"
            >
              Browse components
            </Link>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
