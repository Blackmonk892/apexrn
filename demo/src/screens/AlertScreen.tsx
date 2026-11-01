import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle, Button, Text, spacing, useTheme } from '@apexrn/ui';
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
  return <View style={[styles.swatch, { backgroundColor: colors.foreground }]} />;
}

export default function AlertScreen({ onBack }: { onBack: () => void }) {
  const [log, setLog] = useState('No action yet');

  return (
    <Layout id="alert" title="ALERT" onBack={onBack}>
      <Section
        title="Variants"
        note="Each variant has its own glyph. Destructive and warning are announced when they appear; the others are read in order."
      >
        <View style={styles.stack}>
          {VARIANTS.map((a) => (
            <Alert key={a.variant} variant={a.variant} title={a.title} description={a.description} testID={`alert-${a.variant}`} />
          ))}
        </View>
      </Section>

      <Section title="States" note="An alert is persistent content: no press, focus or disabled state. It can carry an action.">
        <View style={styles.stack}>
          <Alert
            variant="destructive"
            title="Upload failed"
            description="report-q3.pdf could not be sent."
            action={
              <Button title="Retry" variant="outline" size="sm" testID="alert-retry" onPress={() => setLog('Retried')} />
            }
          />
          <Alert variant="success" title="Copied to clipboard" />
        </View>
        <Text variant="mono" testID="alert-log">
          {log}
        </Text>
      </Section>

      <Section title="In context" note="Compound parts for content the shorthand props do not cover.">
        <Alert variant="warning" icon={<Swatch />}>
          <AlertTitle>Scheduled maintenance</AlertTitle>
          <AlertDescription>The service is unavailable on Sunday from 02:00 to 03:00.</AlertDescription>
          <AlertDescription>Open orders are kept and resume afterwards.</AlertDescription>
        </Alert>
      </Section>

      <Section title="Edge cases">
        <View style={styles.stack}>
          <Alert
            variant="destructive"
            title="This title is long enough that it has to wrap onto a second line and then truncate after that"
            description="A long description wraps freely without truncating, so the alert grows with its content instead of clipping it."
          />
          <View style={styles.narrow}>
            <Alert
              variant="warning"
              title="Low battery"
              description="Connect a charger before the sync starts."
              action={<Button title="Sync later" variant="outline" size="sm" />}
            />
          </View>
        </View>
        <Caption>Titles clamp to two lines; descriptions wrap. The second alert sits in a 240pt container.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  narrow: { width: 240 },
  swatch: { width: 22, height: 22 },
});
