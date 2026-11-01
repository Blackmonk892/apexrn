import type { Metadata } from "next";
import Link from "next/link";
import { PartsList } from "@/components/PartsList";
import { getPartCount } from "@/lib/parts";

export const metadata: Metadata = {
  title: "Docs",
  description: "How to add ApexRN parts to an Expo app, change the theme, and look up the props of each part.",
};

export default function DocsIndex() {
  return (
    <>
      <h1 className="t-h2">Docs</h1>
      <p>
        ApexRN is a set of React Native parts that you copy into your Expo app as source files. After
        the copy, the code is yours: read it, edit it, delete what you do not use.
      </p>
      <section>
        <h2 className="t-h3" id="getting-started">
          Getting started
        </h2>
        <ul className="plain">
          <li>
            <Link href="/docs/installation">Installation</Link>: init the project, add a part, install peers.
          </li>
          <li>
            <Link href="/docs/theming">Theming</Link>: every colour token, both presets, the depth ladder.
          </li>
          <li>
            <Link href="/docs/cli">CLI</Link>: init, add, diff and list, with real output.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="t-h3" id="parts">
          Parts ({getPartCount()})
        </h2>
        <PartsList />
      </section>
    </>
  );
}
