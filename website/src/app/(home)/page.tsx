import type { Metadata } from "next";
import { BuiltWith } from "@/components/landing/built-with";
import { Catalogue } from "@/components/landing/catalogue";
import { parts, part, version } from "@/components/landing/data";
import { PosterFooter } from "@/components/landing/footer";
import { InstallBlock } from "@/components/landing/install-block";
import { LooksControls } from "@/components/landing/looks-controls";
import { OwnTheCode } from "@/components/landing/own-the-code";
import { PhoneStage, type Leader } from "@/components/landing/phone-stage";
import { INIT_COMMAND } from "@/lib/site";
import "@/components/landing/landing.css";

export const metadata: Metadata = {
  title: { absolute: "ApexRN: brutalist parts for React Native" },
  description: "A CLI copies brutalist React Native components into your Expo app. You own every line.",
};

const ON_SCREEN: Omit<Leader, "number" | "name">[] = [
  { slug: "app-bar", side: "left", top: 4, reach: 40 },
  { slug: "search-bar", side: "left", top: 13, reach: 60 },
  { slug: "list-item", side: "left", top: 31, reach: 60 },
  { slug: "segmented-control", side: "right", top: 20, reach: 60 },
  { slug: "floating-action-button", side: "right", top: 87, reach: 50 },
  { slug: "bottom-nav", side: "right", top: 96, reach: 60 },
];

export default function Home() {
  const leaders: Leader[] = ON_SCREEN.map((l) => ({ ...l, number: part(l.slug).number, name: part(l.slug).name }));
  return (
    <main className="lp">
      <section className="lp-hero" aria-labelledby="lp-h1">
        <h1 id="lp-h1" className="lp-h1">
          Brutalist parts for React Native.
        </h1>
        <div className="lp-hero-row">
          <div className="lp-cell">
            <InstallBlock command={INIT_COMMAND} />
          </div>
          <p className="lp-cell lp-hero-copy">Copy components into your app with one command. You own every line.</p>
          <p className="lp-cell lp-hero-meta">
            v{version} · {parts.length} parts · MIT
          </p>
        </div>
      </section>

      <section className="lp-section" aria-labelledby="lp-live">
        <h2 id="lp-live" className="lp-h2">
          A live screen made of parts
        </h2>
        <PhoneStage leaders={leaders} />
      </section>

      <section className="lp-section" aria-labelledby="lp-looks">
        <h2 id="lp-looks" className="lp-h2">
          Two looks, one token file
        </h2>
        <div className="lp-looks">
          <p className="lp-text">
            Both looks are token sets in <code translate="no">lib/apexrn/colors.ts</code>. Edit the file and every part follows. These switches drive the phone above and the rest of this site.
          </p>
          <LooksControls />
        </div>
      </section>

      <section className="lp-section" aria-labelledby="lp-parts">
        <h2 id="lp-parts" className="lp-h2">
          All {parts.length} parts
        </h2>
        <Catalogue parts={parts} />
      </section>

      <section className="lp-section" aria-labelledby="lp-own">
        <h2 id="lp-own" className="lp-h2">
          You own every line
        </h2>
        <p className="lp-text lp-lede">The CLI writes plain source files into your project. Nothing is imported from a package, so you can edit any of it.</p>
        <OwnTheCode />
      </section>

      <section className="lp-section" aria-labelledby="lp-built">
        <h2 id="lp-built" className="lp-h2">
          Built with ApexRN
        </h2>
        <p className="lp-text lp-lede">Three reference screens made from the parts in the catalogue.</p>
        <BuiltWith />
      </section>

      <PosterFooter />
    </main>
  );
}
