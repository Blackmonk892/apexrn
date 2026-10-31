import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, BrutalSurface, textStyles, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const VARIANTS = ['default', 'primary', 'outline', 'accent', 'destructive', 'success', 'warning'] as const;

export default function BadgeScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();

  return (
    <Layout id="badge" title="BADGE" onBack={onBack}>
      <Section title="Variants" note="Destructive, success and warning carry an icon as well as colour.">
        <View style={styles.row}>
          {VARIANTS.map((v) => (
            <Badge key={v} variant={v} label={v} testID={`badge-${v}`} />
          ))}
        </View>
      </Section>

      <Section title="Counts" note="Counts are mono. Past max they read 99+, and assistive tech still hears the real number.">
        <View style={styles.row}>
          <Badge count={0} variant="outline" testID="badge-count-0" />
          <Badge count={7} variant="primary" testID="badge-count-7" />
          <Badge count={99} variant="accent" testID="badge-count-99" />
          <Badge count={120} variant="destructive" testID="badge-count-120" />
          <Badge count={12} max={9} testID="badge-count-max" />
        </View>
      </Section>

      <Section title="States" note="A badge is static content: no press, focus or disabled state.">
        <View style={styles.row}>
          <Badge variant="success" label="Paid" />
          <Badge variant="warning" label="Overdue" />
          <Badge variant="destructive" label="Failed" />
        </View>
      </Section>

      <Section title="In context">
        <BrutalSurface pressable={false} surfaceStyle={styles.card}>
          <View style={styles.cardHead}>
            <Text style={[textStyles.title, { color: colors.foreground }]}>Invoice 2041</Text>
            <Badge variant="success" label="Paid" />
          </View>
          <Text style={[textStyles.body, { color: colors.mutedForeground }]}>Studio retainer, October</Text>
          <View style={styles.cardHead}>
            <Text style={[textStyles.mono, { color: colors.foreground }]}>EUR 4,200.00</Text>
            <Badge count={3} variant="accent" accessibilityLabel="3 comments" />
          </View>
        </BrutalSurface>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Badge variant="primary" label="A very long badge label that must truncate" testID="badge-long" />
        </View>
        <Caption>Single line, truncated with an ellipsis, in a 120pt container.</Caption>
        <Badge count={1234567} max={999} testID="badge-large" />
        <Caption>A large count caps at max.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { padding: 16, gap: 8 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  narrow: { width: 120 },
});
