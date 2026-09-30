"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import PhoneFrame from "./PhoneFrame";

const INIT_COMMAND = "npx apexrn init";

export default function HeroSection() {
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const phoneScale = useTransform(
    scrollYProgress,
    [0, 0.5, 0.9],
    prefersReducedMotion ? [1, 1, 1] : [0.64, 0.98, 1.2],
  );
  const phoneY = useTransform(
    scrollYProgress,
    [0, 0.5, 0.9],
    prefersReducedMotion ? [0, 0, 0] : [56, -18, -76],
  );
  const phoneRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 0.9],
    prefersReducedMotion ? [0, 0, 0] : [-6, -1.5, 0.5],
  );
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.4], prefersReducedMotion ? [0, 0] : [0, -44]);
  const calloutOpacity = useTransform(scrollYProgress, [0.15, 0.4, 0.75, 0.9], [0, 1, 1, 0]);
  const calloutY = useTransform(scrollYProgress, [0.15, 0.4], prefersReducedMotion ? [0, 0] : [10, 0]);

  const handleCopy = () => {
    navigator.clipboard.writeText(INIT_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section ref={sectionRef} className="relative h-[240vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-grid">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-1 items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div style={{ opacity: textOpacity, y: textY }} className="relative z-10 pt-16 lg:pt-0">
            <p className="text-sm font-medium text-[var(--fg-muted)]">
              A component library for React Native and Expo, written in TypeScript.
            </p>

            <h1 className="font-display mt-4 max-w-xl text-[13vw] font-semibold leading-[0.98] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Interfaces with hard edges, not rounded defaults.
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--fg-muted)]">
              ApexRN is a brutalist component library you copy into your own project: thick borders, offset
              shadows and real press physics, themed from a single token file.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="edge-block flex items-center bg-[var(--surface)]">
                <span className="font-mono px-4 py-3 text-sm text-[var(--fg)]">{INIT_COMMAND}</span>
                <button
                  onClick={handleCopy}
                  aria-label="Copy installation command"
                  className="flex items-center gap-1.5 border-l-2 border-[var(--edge)] px-3 py-3 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>

              <a
                href="#components"
                className="press-block px-4 py-3 text-sm font-semibold text-[var(--fg)] underline decoration-2 underline-offset-4 decoration-[var(--coral)]"
              >
                Browse components
              </a>
            </div>

            <dl className="mt-10 flex max-w-md flex-wrap gap-x-8 gap-y-3 border-t-2 border-[var(--hairline)] pt-5">
              {[
                ["36", "components"],
                ["57", "Expo SDK"],
                ["MIT", "licensed"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-mono text-lg font-medium text-[var(--fg)]">{value}</dt>
                  <dd className="text-xs text-[var(--fg-muted)]">{label}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            id="phone"
            style={{ scale: phoneScale, y: phoneY, rotate: phoneRotate }}
            className="relative z-10 flex justify-center lg:justify-end"
          >
            <PhoneFrame screen="showcase" eager />

            <motion.div
              style={{ opacity: calloutOpacity, y: calloutY }}
              className="edge-block-sm pointer-events-none absolute -left-6 top-[18%] hidden max-w-[150px] -translate-x-full bg-[var(--surface)] px-3 py-2 sm:block"
            >
              <p className="font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--coral)]">
                Live render
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-[var(--fg-muted)]">
                Real @apexrn/ui, not a screenshot.
              </p>
            </motion.div>

            <motion.div
              style={{ opacity: calloutOpacity, y: calloutY }}
              className="edge-block-sm pointer-events-none absolute -right-4 bottom-[22%] hidden max-w-[140px] translate-x-full bg-[var(--surface)] px-3 py-2 sm:block"
            >
              <p className="font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--cobalt)]">
                Press physics
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-[var(--fg-muted)]">
                Spring + haptic on every tap.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
