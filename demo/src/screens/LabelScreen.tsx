import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input, Label, spacing } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function LabelScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');

  return (
    <Layout id="label" title="LABEL" onBack={onBack}>
      <Section title="Variants" note="A required label shows a * and is announced as required.">
        <Label>Email address</Label>
        <View testID="label-required">
          <Label required>Email address</Label>
        </View>
      </Section>

      <Section title="States" note="Disabled mutes the label while its control is unavailable.">
        <Label disabled>Username</Label>
        <Label disabled required>Billing postcode</Label>
      </Section>

      <Section title="In context">
        <View style={{ marginBottom: spacing.md }}>
          <Label required nativeID="label-email">Email address</Label>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            accessibilityLabelledBy="label-email"
          />
        </View>
        <View style={{ marginBottom: spacing.md }}>
          <Label disabled>Username</Label>
          <Input value="apex_user" editable={false} />
        </View>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Label required>Preferred contact method for delivery updates</Label>
        </View>
        <Caption>Wraps inside a 180pt container; text scales up to 1.3x.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  narrow: { width: 180 },
});
