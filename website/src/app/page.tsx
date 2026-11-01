import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { BuiltWith } from "@/components/BuiltWith";
import { CodeBlock } from "@/components/CodeBlock";
import { InstallBlock } from "@/components/InstallBlock";
import { LooksPhone } from "@/components/LooksPhone";
import { MonoLabel } from "@/components/MonoLabel";
import { PartsTable } from "@/components/PartsTable";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Terminal } from "@/components/Terminal";
import capture from "@/generated/cli-capture.json";
import { getPart, getVersion } from "@/lib/parts";
import { INIT_COMMAND } from "@/lib/site";
import { SHOWCASE_URL } from "@/lib/base-path";

export const metadata: Metadata = {
  title: { absolute: "ApexRN: brutalist UI parts for React Native" },
  description:
    "Copy React Native components into your Expo app with one command and own every line. Thick borders, zero radius, hard shadows.",
  alternates: process.env.NEXT_PUBLIC_SITE_URL ? { canonical: "/" } : undefined,
};

function leader(slug: string, label: string, y: number) {
  return { y, label, part: getPart(slug)?.number ?? "" };
}

function drawerSource(): string {
  const file = join(process.cwd(), "..", "packages", "ui", "components", "drawer.tsx");
  return readFileSync(file, "utf8").replace(/\r\n/g, "\n").split("\n").slice(0, 20).join("\n");
}

export default function Home() {
  return (
    <>
      <section className="page hero grid-12" aria-labelledby="hero-title">
        <div className="col-7 hero-text">
          <MonoLabel as="p">React Native · Copy-paste · v{getVersion()}</MonoLabel>
          <h1 id="hero-title" className="t-hero">
            Brutalist UI parts for React Native.
          </h1>
          <p style={{ margin: 0, maxWidth: 520 }}>
            Copy components into your app with one command. You own every line.
          </p>
          <div className="hero-install">
            <InstallBlock command={INIT_COMMAND} />
          </div>
          <p className="hero-links">
            <a href="#parts">Browse all parts →</a>
            <Link href="/docs/installation">Read the docs →</Link>
          </p>
        </div>
        <div className="col-5 hero-phone">
          <PhoneFrame
            src={SHOWCASE_URL}
            title="Live ApexRN components running in a phone-sized preview"
            leaders={[
              leader("drawer", "Drawer", 8),
              leader("button", "Button", 34),
              leader("bottom-nav", "Bottom nav", 92),
            ]}
          />
        </div>
      </section>

      <section id="parts" className="section" aria-labelledby="parts-title">
        <div className="page">
          <h2 id="parts-title" className="t-h2 section-title">
            Parts index
          </h2>
          <PartsTable />
        </div>
      </section>

      <section className="section" aria-labelledby="looks-title">
        <div className="page">
          <LooksPhone>
            <h2 id="looks-title" className="t-h2">
              Two looks
            </h2>
            <p style={{ margin: 0, maxWidth: 480 }}>
              Two presets ship in the box. Edit colors.ts to make your own.
            </p>
          </LooksPhone>
        </div>
      </section>

      <section className="section" aria-labelledby="own-title">
        <div className="page">
          <h2 id="own-title" className="t-h2 section-title">
            You own the code
          </h2>
          <div className="own-grid">
            <Terminal command={capture.command} output={capture.stdout} />
            <div className="own-right">
              <pre className="code-block code" tabIndex={0} aria-label="Files written into your project">
                <code>{capture.files.join("\n")}</code>
              </pre>
              <CodeBlock code={drawerSource()} label="components/apexrn/drawer.tsx" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="built-title">
        <div className="page">
          <h2 id="built-title" className="t-h2 section-title">
            Built with ApexRN
          </h2>
          <BuiltWith />
        </div>
      </section>
    </>
  );
}
