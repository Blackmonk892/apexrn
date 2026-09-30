import React from "react";
import GithubIcon from "./GithubIcon";
import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section className="relative w-full overflow-hidden border-t-2 border-[var(--edge)] bg-grid py-28">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal className="flex items-center justify-center gap-3">
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-[var(--coral)]">06</span>
          <span className="h-px w-7 bg-[var(--hairline)]" aria-hidden="true" />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--fg-muted)]">
            Ready when you are
          </span>
        </Reveal>

        <h2 className="font-display mx-auto mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
          Build something with edges.
        </h2>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#install"
            className="edge-block press-block bg-[var(--fg)] px-6 py-3.5 text-sm font-semibold text-[var(--bg)]"
          >
            Get started
          </a>
          <a
            href="#components"
            className="press-block border-2 border-[var(--hairline)] px-6 py-3.5 text-sm font-semibold hover:border-[var(--edge)]"
          >
            Browse components
          </a>
          <a
            href="https://github.com/Blackmonk892/apexrn"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border-2 border-[var(--hairline)] px-6 py-3.5 text-sm font-semibold hover:border-[var(--edge)]"
          >
            <GithubIcon size={15} />
            GitHub
          </a>
        </Reveal>
      </div>
    </section>
  );
}
