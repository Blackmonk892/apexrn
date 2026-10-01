"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import PhoneFrame from "./PhoneFrame";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { highlightLine } from "@/lib/highlight";

/** Verbatim snippets from docs/components.md — kept in sync with that file, never hand-written. */
const SPECIMENS = [
  {
    name: "Button",
    screen: "button",
    code: `import { Button } from '@/components/apexrn';

export function SaveButton() {
  return (
    <>
      <Button variant="primary" onPress={() => console.log('saved')}>Save</Button>
      <Button variant="destructive" size="sm">Delete</Button>
      <Button variant="outline" loading>Uploading</Button>
    </>
  );
}`,
  },
  {
    name: "Card",
    screen: "card",
    code: `import { Button, Card, CardFooter, CardHeader, CardText } from '@/components/apexrn';

export function PlanCard() {
  return (
    <Card variant="accent">
      <CardHeader>
        <CardText tone="title">Pro plan</CardText>
      </CardHeader>
      <CardText tone="title">$9 / month</CardText>
      <CardText tone="muted">Unlimited projects.</CardText>
      <CardFooter>
        <Button variant="primary">Upgrade</Button>
      </CardFooter>
    </Card>
  );
}`,
  },
  {
    name: "Dialog",
    screen: "dialog",
    code: `import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/apexrn';

export function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>This will apply immediately.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="primary">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`,
  },
  {
    name: "ListItem",
    screen: "listitem",
    code: `import { ListItem } from '@/components/apexrn';

export function SettingsRow() {
  return <ListItem title="Notifications" description="Manage alerts" onPress={() => {}} />;
}`,
  },
];

export default function ExploreSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const active = SPECIMENS[activeIdx];
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = () => {
    navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="explore" className="relative w-full py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title="The code you'll actually ship."
          description="Pick a component below. The snippet on the left is copied straight from the repository's docs — the phone on the right is that same code, compiled and running."
        />

        <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-2">
          {SPECIMENS.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveIdx(i)}
              aria-pressed={i === activeIdx}
              className={`relative border-2 px-3.5 py-1.5 text-sm font-medium transition-colors ${
                i === activeIdx
                  ? "border-[var(--edge)] bg-[var(--fg)] text-[var(--bg)]"
                  : "border-[var(--hairline)] text-[var(--fg-muted)] hover:border-[var(--edge)] hover:text-[var(--fg)]"
              }`}
            >
              {s.name}
            </button>
          ))}
        </Reveal>

        <Reveal delay={0.15} className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="edge-block overflow-hidden bg-[var(--surface)]">
            <div className="flex items-center justify-between border-b-2 border-[var(--edge)] px-4 py-2.5">
              <span className="font-mono text-xs text-[var(--fg-muted)]">{active.name}Demo.tsx</span>
              <button
                onClick={handleCopy}
                aria-label="Copy code"
                className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.pre
                  key={active.name}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-x-auto p-4 text-[12.5px] leading-relaxed"
                >
                  <code className="font-mono">
                    {active.code.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="mr-4 w-5 flex-shrink-0 select-none text-right text-[var(--fg-muted)] opacity-50">
                          {i + 1}
                        </span>
                        <span className="whitespace-pre">{highlightLine(line)}</span>
                      </div>
                    ))}
                  </code>
                </motion.pre>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex justify-center">
            <PhoneFrame screen={active.screen} maxWidth={260} />
          </div>
        </Reveal>

        <Reveal delay={0.2} className="mt-5 text-sm text-[var(--fg-muted)]">
          36 components live in the registry — these four are a sample. The full set is in the{" "}
          <Link href="/docs/components" className="text-[var(--fg)] underline decoration-2 underline-offset-2 decoration-[var(--coral)]">
            component docs
          </Link>
          .
        </Reveal>
      </div>
    </section>
  );
}
