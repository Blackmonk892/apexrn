import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Separator, Text } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

const SETTINGS = ['Profile', 'Notifications', 'Privacy and security'];

export default function SeparatorScreen({ onBack }: { onBack: () => void }) {
  return (
    <Layout id="separator" title="SEPARATOR" onBack={onBack}>
      <Section title="Variants" note="Two pixels of border colour. Nothing else.">
        <Text>Order summary</Text>
        <Separator />
        <Text>Delivery details</Text>
        <View style={styles.row}>
          <Text>Draft</Text>
          <Separator orientation="vertical" />
          <Text>Review</Text>
          <Separator orientation="vertical" />
          <Text>Published</Text>
        </View>
      </Section>

      <Section title="Labelled" note="The label is plain text; the rules are hidden from screen readers.">
        <Separator label="Account" testID="separator-labelled" />
      </Section>

      <Section title="In context">
        <Text variant="title">Settings</Text>
        {SETTINGS.map((item, i) => (
          <View key={item}>
            {i > 0 ? <Separator /> : null}
            <Text style={styles.item}>{item}</Text>
          </View>
        ))}
        <Separator label="Danger zone" />
        <Text style={styles.item}>Delete workspace</Text>
      </Section>

      <Section title="Edge cases" note="A long label wraps between its rules rather than pushing them off screen.">
        <View style={styles.narrow}>
          <Separator label="Billing address and payment method for the annual plan" />
        </View>
        <Separator orientation="vertical" style={styles.short} />
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, height: 40 },
  item: { paddingVertical: 12 },
  narrow: { width: 320, maxWidth: '100%' },
  short: { height: 24 },
});
