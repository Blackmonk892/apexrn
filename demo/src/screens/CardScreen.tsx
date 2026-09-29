import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, CardFooter, CardHeader, CardText } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const VARIANTS = ['default', 'primary', 'accent'] as const;

export default function CardScreen({ onBack }: { onBack: () => void }) {
  const [taps, setTaps] = useState(0);

  return (
    <Layout title="CARD" onBack={onBack}>
      <Section title="Variants">
        <View style={styles.stack}>
          {VARIANTS.map((v) => (
            <Card key={v} variant={v}>
              <CardText tone="title">{v} card</CardText>
              <CardText style={styles.gap}>Thick border, hard shadow, flat fill.</CardText>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Composed" note="CardHeader and CardFooter run edge to edge with their own dividers.">
        <Card>
          <CardHeader>
            <CardText tone="title">Pro plan</CardText>
          </CardHeader>
          <CardText tone="title" style={styles.price}>$9 / month</CardText>
          <CardText tone="muted" style={styles.gap}>Unlimited projects and priority support.</CardText>
          <CardFooter>
            <Button title="Upgrade" variant="primary" />
          </CardFooter>
        </Card>
      </Section>

      <Section title="Pressable" note="Passing onPress turns the card into a button with press physics.">
        <Card variant="accent" onPress={() => setTaps((n) => n + 1)} accessibilityLabel="Open release notes" accessibilityHint="Opens the release notes">
          <CardText tone="title">Release notes</CardText>
          <CardText style={styles.gap}>See what changed in 2.0.</CardText>
        </Card>
        <Caption>{`Taps: ${taps}`}</Caption>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Card>
            <CardText tone="title">A card title that is far too long for a narrow container</CardText>
          </Card>
        </View>
        <Caption>Text wraps inside a 220pt container.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 20, paddingBottom: 4 },
  gap: { marginTop: 6 },
  price: { fontSize: 24 },
  narrow: { width: 220 },
});
