import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, CardFooter, CardHeader, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const VARIANTS = ['default', 'primary', 'accent'] as const;

export default function CardScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [taps, setTaps] = useState(0);

  // Card does not tint its children, so each variant pairs with its own foreground.
  const foreground = {
    default: colors.foreground,
    primary: colors.primaryForeground,
    accent: colors.accentForeground,
  };

  return (
    <Layout title="CARD" onBack={onBack}>
      <Section title="Variants">
        <View style={styles.stack}>
          {VARIANTS.map((v) => (
            <Card key={v} variant={v}>
              <Text style={[styles.title, { color: foreground[v] }]}>{v} card</Text>
              <Text style={[styles.body, { color: foreground[v] }]}>
                Thick border, hard shadow, flat fill.
              </Text>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Composed" note="CardHeader and CardFooter run edge to edge with their own dividers.">
        <Card>
          <CardHeader>
            <Text style={[styles.title, { color: colors.foreground }]}>Pro plan</Text>
          </CardHeader>
          <Text style={[styles.price, { color: colors.foreground }]}>$9 / month</Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>Unlimited projects and priority support.</Text>
          <CardFooter>
            <Button title="Upgrade" variant="primary" />
          </CardFooter>
        </Card>
      </Section>

      <Section title="Pressable" note="Passing onPress turns the card into a button with press physics.">
        <Card variant="accent" onPress={() => setTaps((n) => n + 1)} accessibilityLabel="Open release notes" accessibilityHint="Opens the release notes">
          <Text style={[styles.title, { color: colors.accentForeground }]}>Release notes</Text>
          <Text style={[styles.body, { color: colors.accentForeground }]}>See what changed in 2.0.</Text>
        </Card>
        <Caption>{`Taps: ${taps}`}</Caption>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Card>
            <Text style={[styles.title, { color: colors.foreground }]}>
              A card title that is far too long for a narrow container
            </Text>
          </Card>
        </View>
        <Caption>Text wraps inside a 220pt container.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 20, paddingBottom: 4 },
  title: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  body: { fontSize: 14, marginTop: 6 },
  price: { fontSize: 24, fontWeight: '900' },
  narrow: { width: 220 },
});
