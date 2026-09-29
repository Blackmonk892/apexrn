import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input, Label } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function LabelScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');

  return (
    <Layout title="LABEL" onBack={onBack}>
      <Section title="Default">
        <Label>Email address</Label>
        <Caption>Names a form control.</Caption>
      </Section>

      <Section title="Disabled" note="Mutes the label when the control it names is unavailable.">
        <Label disabled>Username</Label>
      </Section>

      <Section title="With a control">
        <View style={styles.field}>
          <Label>Email address</Label>
          <Input value={email} onChangeText={setEmail} placeholder="you@example.com" />
        </View>
        <View style={styles.field}>
          <Label disabled>Username</Label>
          <Input value="apex_user" editable={false} />
        </View>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Label>A long label that wraps onto a second line when space runs out</Label>
        </View>
        <Caption>Wraps inside a 180pt container; text scales up to 1.3x.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  narrow: { width: 180 },
});
