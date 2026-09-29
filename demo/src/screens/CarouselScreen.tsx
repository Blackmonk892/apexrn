import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BrutalSurface, Carousel, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function CarouselScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);

  const slides = [
    { id: 'a', title: 'Ship', bg: colors.primary, fg: colors.primaryForeground },
    { id: 'b', title: 'Test', bg: colors.secondary, fg: colors.secondaryForeground },
    { id: 'c', title: 'Learn', bg: colors.accent, fg: colors.accentForeground },
    { id: 'd', title: 'Repeat', bg: colors.success, fg: colors.successForeground },
  ];
  type Slide = (typeof slides)[number];

  const renderSlide = ({ item, index: i }: { item: Slide; index: number }) => (
    <BrutalSurface pressable={false} backgroundColor={item.bg} surfaceStyle={styles.card}>
      <Text style={[styles.step, { color: item.fg }]}>{`${i + 1} of ${slides.length}`}</Text>
      <Text style={[styles.title, { color: item.fg }]}>{item.title}</Text>
    </BrutalSurface>
  );

  return (
    <Layout title="CAROUSEL" onBack={onBack}>
      <Section title="Default" note="Items are 80% of the screen; the next one peeks in. Swipe to snap.">
        <Carousel data={slides} keyExtractor={(s) => s.id} renderItem={renderSlide} />
      </Section>

      <Section title="Indicators and fixed width" note="showIndicators adds position squares; itemWidth and gap are set explicitly.">
        <Carousel
          data={slides}
          keyExtractor={(s) => s.id}
          showIndicators
          itemWidth={200}
          gap={20}
          onActiveIndexChange={setIndex}
          renderItem={renderSlide}
        />
        <Caption>{`Active index: ${index}`}</Caption>
      </Section>

      <Section title="Edge cases" note="A single item and an empty list both render without errors.">
        <Carousel data={slides.slice(0, 1)} keyExtractor={(s) => s.id} showIndicators renderItem={renderSlide} />
        <Carousel data={[] as Slide[]} keyExtractor={(s) => s.id} showIndicators renderItem={renderSlide} />
        <Caption>Above: one item (no indicators). Below the line: empty.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { height: 130, padding: 16, justifyContent: 'space-between' },
  step: { fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '900', textTransform: 'uppercase' },
});
