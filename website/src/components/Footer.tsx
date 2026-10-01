import React from "react";
import GithubIcon from "./GithubIcon";

export default function Footer() {
  return (
    <footer className="w-full border-t-2 border-[var(--edge)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
        <p className="text-sm text-[var(--fg-muted)]">ApexRN — MIT licensed, open source.</p>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--fg-muted)]">
          <a href="#explore" className="hover:text-[var(--fg)]">Explore</a>
          <a href="#install" className="hover:text-[var(--fg)]">Install</a>
          <a href="/docs" className="hover:text-[var(--fg)]">Docs</a>
        </nav>

        <a
          href="https://github.com/Blackmonk892/apexrn"
          target="_blank"
          rel="noreferrer"
          aria-label="ApexRN on GitHub"
          className="flex h-9 w-9 items-center justify-center border-2 border-[var(--hairline)] text-[var(--fg)] hover:border-[var(--edge)]"
        >
          <GithubIcon size={15} />
        </a>
      </div>
    </footer>
  );
}
