"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import GithubIcon from "./GithubIcon";
import { useSiteTheme } from "@/context/ThemeContext";

const LINKS = [
  { href: "#explore", label: "Explore" },
  { href: "#install", label: "Install" },
  { href: "/docs", label: "Docs" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useSiteTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[var(--edge)] bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <span className="edge-block-sm flex h-8 w-8 items-center justify-center bg-[var(--coral)] font-display text-sm font-bold text-[var(--coral-ink)]">
            N
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">ApexRN</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-9 w-9 items-center justify-center border-2 border-[var(--hairline)] text-[var(--fg)] transition-colors hover:border-[var(--edge)]"
            suppressHydrationWarning
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <a
            href="https://github.com/Blackmonk892/apexrn"
            target="_blank"
            rel="noreferrer"
            aria-label="ApexRN on GitHub"
            className="hidden h-9 w-9 items-center justify-center border-2 border-[var(--hairline)] text-[var(--fg)] transition-colors hover:border-[var(--edge)] sm:flex"
          >
            <GithubIcon size={15} />
          </a>

          <a
            href="/docs/installation"
            className="edge-block-sm press-block bg-[var(--fg)] px-3.5 py-2 text-sm font-semibold text-[var(--bg)]"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
