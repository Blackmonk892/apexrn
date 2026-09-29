import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Alert, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const VARIANTS = [
  { variant: 'default', title: 'Heads up', description: 'Your draft was saved to this device.' },
  { variant: 'destructive', title: 'Payment failed', description: 'Your card was declined. Update it to keep your plan.' },
  { variant: 'warning', title: 'Storage almost full', description: '92% of your storage is used.' },
  { variant: 'success', title: 'Profile updated', description: 'Your changes are live.' },
] as const;

function Swatch() {
  const { colors } = useTheme();
  return <View style={[styles.customIcon, { backgroundColor: colors.foreground }]} />;
}

export default function AlertScreen({ onBack }: { onBack: () => void }) {
  return (
    <Layout title="ALERT" onBack={onBack}>
      <Section
        title="Variants"
        note="Severity is never colour-only: each variant has its own glyph, and screen readers hear the severity first."
      >
        <View style={styles.stack}>
          {VARIANTS.map((a) => (
            <Alert key={a.variant} variant={a.variant} title={a.title} description={a.description} />
          ))}
        </View>
      </Section>

      <Section title="Title only">
        <View style={styles.stack}>
          <Alert variant="success" title="Copied to clipboard" />
          <Alert variant="destructive" title="No connection" />
        </View>
      </Section>

      <Section title="Custom icon" note="icon replaces the built-in glyph.">
        <Alert
          variant="warning"
          title="Scheduled maintenance"
          description="The service is unavailable on Sunday from 02:00 to 03:00."
          icon={<Swatch />}
        />
      </Section>

      <Section title="Edge cases">
        <View style={styles.stack}>
          <Alert
            variant="destructive"
            title="This title is long enough that it has to wrap onto a second line and then truncate after that"
            description="A long description wraps freely without truncating, so the alert grows with its content instead of clipping it."
          />
        </View>
        <Caption>Titles clamp to two lines; descriptions wrap.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16, paddingBottom: 4 },
  customIcon: { width: 22, height: 22 },
});
