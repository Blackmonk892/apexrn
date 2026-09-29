import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Label, Textarea, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

const LIMIT = 80;

export default function TextareaScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [bio, setBio] = useState('');
  const over = bio.length > LIMIT;

  return (
    <Layout title="TEXTAREA" onBack={onBack}>
      <Section title="Default" note="Always multiline, text starts at the top.">
        <Textarea placeholder="Write a description" />
      </Section>

      <Section title="Custom height" note="Set the height through inputStyle.">
        <Textarea placeholder="This one is much taller" inputStyle={styles.tall} />
      </Section>

      <Section title="Error" note="Same error treatment as Input: destructive border and a permanent shadow.">
        <Label>Bio</Label>
        <Textarea placeholder="Tell us about yourself" value={bio} onChangeText={setBio} error={over} />
        <Text style={[styles.count, { color: over ? colors.destructive : colors.mutedForeground }]}>
          {over ? `${bio.length - LIMIT} characters over the limit` : `${bio.length} / ${LIMIT}`}
        </Text>
      </Section>

      <Section title="Disabled">
        <Textarea placeholder="Cannot type here" disabled />
        <Textarea value={'Read only content.\nSecond line.'} disabled />
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  tall: { minHeight: 200 },
  count: { fontSize: 12, fontWeight: '800', marginTop: 8 },
});
