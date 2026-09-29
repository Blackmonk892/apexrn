import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, BrutalSurface, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const VARIANTS = ['default', 'primary', 'outline', 'accent', 'destructive', 'success', 'warning'] as const;

export default function BadgeScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();

  return (
    <Layout title="BADGE" onBack={onBack}>
      <Section title="Variants">
        <View style={styles.row}>
          {VARIANTS.map((v) => (
            <Badge key={v} variant={v} label={v} />
          ))}
        </View>
      </Section>

      <Section title="With shadow" note="withShadow adds a 2px hard offset.">
        <View style={styles.row}>
          {VARIANTS.map((v) => (
            <Badge key={v} variant={v} label={v} withShadow />
          ))}
        </View>
      </Section>

      <Section title="Custom content" note="children replace the label.">
        <View style={styles.row}>
          <Badge variant="accent">
            <Text style={{ color: colors.accentForeground, fontWeight: '900' }}>★ 4.8</Text>
          </Badge>
        </View>
      </Section>

      <Section title="In context">
        <BrutalSurface pressable={false} surfaceStyle={styles.card}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>New release</Text>
            <Badge variant="accent" label="v2.0" withShadow />
          </View>
          <Text style={{ color: colors.foreground }}>Faster press physics and a new dark theme.</Text>
        </BrutalSurface>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Badge variant="primary" label="A very long badge label that must truncate" />
        </View>
        <Caption>Single line, truncated with an ellipsis, in a 120pt container.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { padding: 16, gap: 8 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  narrow: { width: 120 },
});
