import React from "react";
import GithubIcon from "./GithubIcon";
import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section className="relative w-full overflow-hidden border-t-2 border-[var(--edge)] bg-grid py-28">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="font-display mx-auto max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Build something with edges.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#install"
            className="edge-block press-block bg-[var(--fg)] px-6 py-3.5 text-sm font-semibold text-[var(--bg)]"
          >
            Get started
          </a>
          <a
            href="#explore"
            className="press-block border-2 border-[var(--hairline)] px-6 py-3.5 text-sm font-semibold hover:border-[var(--edge)]"
          >
            See it running
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
