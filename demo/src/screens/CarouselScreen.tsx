import React, { useState } from 'react';
import { BrutalSurface, Carousel, Text, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function CarouselScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const [pinned, setPinned] = useState(1);

  const slides = [
    { id: 'a', title: 'Ship', bg: colors.primary, fg: colors.primaryForeground },
    { id: 'b', title: 'Test', bg: colors.secondary, fg: colors.secondaryForeground },
    { id: 'c', title: 'Learn', bg: colors.accent, fg: colors.accentForeground },
    { id: 'd', title: 'Repeat', bg: colors.success, fg: colors.successForeground },
  ];
  type Slide = (typeof slides)[number];

  const renderSlide = ({ item, index: i }: { item: Slide; index: number }) => (
    <BrutalSurface pressable={false} backgroundColor={item.bg} surfaceStyle={{ height: 130, padding: 16, justifyContent: 'space-between' }}>
      <Text variant="mono" tone="inherit" style={{ color: item.fg }}>{`${i + 1} of ${slides.length}`}</Text>
      <Text variant="display" tone="inherit" style={{ color: item.fg }}>{item.title}</Text>
    </BrutalSurface>
  );

  return (
    <Layout id="carousel" title="CAROUSEL" onBack={onBack}>
      <Section title="Controlled, with controls" note="index + onIndexChange. Swipe, or use the buttons; they disable at the ends.">
        <Carousel
          testID="carousel-main"
          data={slides}
          keyExtractor={(s) => s.id}
          index={index}
          onIndexChange={setIndex}
          showIndicators
          showControls
          renderItem={renderSlide}
        />
        <Text variant="mono" testID="carousel-log">{`Index: ${index}`}</Text>
      </Section>

      <Section title="Uncontrolled, fixed width" note="defaultIndex starts on the second slide; itemWidth and gap are explicit.">
        <Carousel
          data={slides}
          keyExtractor={(s) => s.id}
          defaultIndex={1}
          showIndicators
          itemWidth={200}
          gap={20}
          onIndexChange={setPinned}
          renderItem={renderSlide}
        />
        <Text variant="mono">{`Pinned index: ${pinned}`}</Text>
      </Section>

      <Section title="Edge cases" note="A single slide shows no indicators; an empty list renders nothing.">
        <Carousel data={slides.slice(0, 1)} keyExtractor={(s) => s.id} showIndicators showControls renderItem={renderSlide} />
        <Carousel data={[] as Slide[]} showIndicators showControls renderItem={renderSlide} />
      </Section>
    </Layout>
  );
}
