"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Sun, Moon, X } from "lucide-react";
import GithubIcon from "@/components/GithubIcon";
import { useSiteTheme } from "@/context/ThemeContext";
import { useDismissableOverlay } from "@/lib/use-dismissable-overlay";
import SearchDialog from "@/components/docs/SearchDialog";
import PlaygroundSidebar from "./PlaygroundSidebar";

export default function PlaygroundHeader() {
  const { theme, toggleTheme } = useSiteTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useDismissableOverlay(mobileOpen, () => setMobileOpen(false), panelRef);
  useEffect(() => {
    if (mobileOpen) closeButtonRef.current?.focus();
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[var(--edge)] bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open playground navigation"
            className="flex h-8 w-8 items-center justify-center border-2 border-[var(--hairline)] text-[var(--fg)] lg:hidden"
          >
            <Menu size={15} />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="edge-block-sm flex h-7 w-7 items-center justify-center bg-[var(--coral)] font-display text-xs font-bold text-[var(--coral-ink)]">
              N
            </span>
            <span className="font-display hidden text-sm font-semibold tracking-tight sm:inline">ApexRN</span>
          </Link>
          <span className="hidden font-mono text-xs text-[var(--fg-muted)] md:inline">/ playground</span>
        </div>

        <div className="flex items-center gap-2">
          <SearchDialog />
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-8 w-8 items-center justify-center border-2 border-[var(--hairline)] text-[var(--fg)] transition-colors hover:border-[var(--edge)]"
            suppressHydrationWarning
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <a
            href="https://github.com/Blackmonk892/apexrn"
            target="_blank"
            rel="noreferrer"
            aria-label="ApexRN on GitHub"
            className="hidden h-8 w-8 items-center justify-center border-2 border-[var(--hairline)] text-[var(--fg)] transition-colors hover:border-[var(--edge)] sm:flex"
          >
            <GithubIcon size={14} />
          </a>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Playground navigation"
            className="relative flex h-full w-[86%] max-w-xs flex-col border-r-2 border-[var(--edge)] bg-[var(--bg)] p-5 overflow-y-auto"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-sm font-semibold">Playground</span>
              <button
                ref={closeButtonRef}
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                <X size={18} />
              </button>
            </div>
            <PlaygroundSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
