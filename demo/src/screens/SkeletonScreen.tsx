import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Skeleton, Text, borderWidths, spacing, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function SkeletonScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [log, setLog] = useState('Event: none yet');

  const toggle = () => {
    setLoaded((v) => !v);
    setLog(loaded ? 'Event: Loading' : 'Event: Loaded');
  };

  return (
    <Layout id="skeleton" title="SKELETON" onBack={onBack}>
      <Section title="Variants" note="A hard-edged band steps across a muted block. Size it with width and height, or ask for lines.">
        <Skeleton width={96} height={96} />
        <Skeleton lines={3} />
      </Section>

      <Section title="States" note="Paused stops the sweep and clears the busy state.">
        <Skeleton paused height={48} />
        <Caption>Also static, with no band, when the OS reduce-motion setting is on.</Caption>
      </Section>

      <Section title="In context" note="Swap the placeholder for the real content once it arrives.">
        <View style={[styles.card, { borderColor: colors.border }]}>
          {loaded ? (
            <View style={styles.stack} testID="skeleton-content">
              <Text variant="title">Invoice 2041</Text>
              <Text variant="body">Paid on 14 March by Northwind Traders. The receipt was sent to billing@northwind.example.</Text>
              <Text variant="mono">USD 1,240.00</Text>
            </View>
          ) : (
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Loading invoice"
              accessibilityState={{ busy: true }}
              style={styles.stack}
              testID="skeleton-placeholder"
            >
              <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={styles.stack}>
                <Skeleton width="50%" height={spacing.xl} />
                <Skeleton lines={3} />
                <Skeleton width={120} height={spacing.lg} />
              </View>
            </View>
          )}
        </View>
        <Button title={loaded ? 'Reset' : 'Load'} variant="outline" testID="skeleton-load" onPress={toggle} />
        <Text variant="mono" testID="skeleton-log">{log}</Text>
      </Section>

      <Section title="Edge cases">
        <Skeleton lines={1} />
        <Skeleton lines={5} height={spacing.md} />
        <View style={styles.narrow}>
          <Skeleton lines={3} />
        </View>
        <Caption>One line stays full width, five lines at a smaller height, and a 160 wide column.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: borderWidths.control, padding: spacing.lg },
  stack: { gap: spacing.md },
  narrow: { width: 160 },
});
