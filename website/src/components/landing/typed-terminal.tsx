"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const CHAR_MS = 30;
const LINE_MS = 70;

type Phase = "static" | "armed" | "typing" | "printing" | "done";

/**
 * Plays the captured CLI run once when it scrolls into view. The server HTML shows everything;
 * the content is only hidden after JS has confirmed motion is allowed, so no-JS and
 * reduced-motion visitors read the full output immediately.
 */
export function TypedTerminal({ command, output, children }: { command: string; output: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("static");
  const [typed, setTyped] = useState(command.length);
  const lines = output.split("\n");
  const [shown, setShown] = useState(lines.length);
  const lineCount = lines.length;

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    function play() {
      setPhase("typing");
      for (let i = 1; i <= command.length; i++) later(() => setTyped(i), i * CHAR_MS);
      const printAt = command.length * CHAR_MS + 200;
      later(() => setPhase("printing"), printAt);
      for (let i = 1; i <= lineCount; i++) later(() => setShown(i), printAt + i * LINE_MS);
      later(() => setPhase("done"), printAt + lineCount * LINE_MS + 120);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        play();
      },
      { threshold: 0.35 },
    );
    const arm = requestAnimationFrame(() => {
      setPhase("armed");
      setTyped(0);
      setShown(0);
      io.observe(el);
    });
    return () => {
      cancelAnimationFrame(arm);
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [command, lineCount]);

  const cursor = phase === "armed" || phase === "typing";
  return (
    <div ref={root} className="lp-split" data-phase={phase}>
      <figure className="lp-split-pane lp-terminal">
        <figcaption className="lp-label lp-split-head">Terminal</figcaption>
        <pre tabIndex={0}>
          <code translate="no">
            <span className="lp-prompt">$ </span>
            {command.slice(0, typed)}
            {cursor ? <span className="lp-cursor" aria-hidden="true" /> : null}
            <span className="lp-ghost">{command.slice(typed)}</span>
            {"\n"}
            {lines.map((line, i) => (
              <span key={i} className={i >= shown ? "lp-ghost" : undefined}>
                {line}
                {"\n"}
              </span>
            ))}
          </code>
        </pre>
      </figure>
      <div className="lp-split-code">{children}</div>
    </div>
  );
}
