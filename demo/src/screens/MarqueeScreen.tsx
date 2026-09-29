import React from 'react';
import { Marquee } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function MarqueeScreen({ onBack }: { onBack: () => void }) {
  return (
    <Layout title="MARQUEE" onBack={onBack}>
      <Section title="Default" note="60 px per second, repeating with a bullet divider.">
        <Marquee text="Breaking news" />
      </Section>

      <Section title="Speed" note="speed is pixels per second.">
        <Caption>30</Caption>
        <Marquee text="Read me slowly" speed={30} />
        <Caption>150</Caption>
        <Marquee text="Special offer" speed={150} />
      </Section>

      <Section title="Custom divider">
        <Marquee text="Sale ends Sunday" divider="  //  " />
      </Section>

      <Section title="Disabled" note="Muted colours and no scrolling.">
        <Marquee text="Currently unavailable" disabled />
      </Section>

      <Section title="Edge cases" note="Reduced motion also renders the text static.">
        <Caption>Short text (repeats to fill the row)</Caption>
        <Marquee text="Go" />
        <Caption>Long text (wider than the screen)</Caption>
        <Marquee text="A headline long enough that a single copy already spans the whole width of the screen" />
      </Section>
    </Layout>
  );
}
