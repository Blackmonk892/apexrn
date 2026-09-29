import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const VARIANTS = ['default', 'primary', 'outline', 'destructive'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const Dot = () => {
  const { colors } = useTheme();
  return <View style={[styles.dot, { backgroundColor: colors.accent, borderColor: colors.border }]} />;
};

export default function ButtonScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [presses, setPresses] = useState(0);
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <Layout title="BUTTON" onBack={onBack}>
      <Text style={[styles.lede, { color: colors.foreground }]}>
        Press to see the block sink into its shadow. Every cell below is the real component.
      </Text>

      <Section title="Variants">
        <View style={styles.row}>
          {VARIANTS.map((v) => (
            <Button key={v} title={v} variant={v} onPress={() => setPresses((n) => n + 1)} />
          ))}
        </View>
        <Caption>{`Presses: ${presses}`}</Caption>
      </Section>

      <Section title="Sizes" note="Heights 40 / 48 / 56. Small buttons extend their hit area to the platform touch target.">
        <View style={[styles.row, styles.rowCenter]}>
          {SIZES.map((sz) => (
            <Button key={sz} title={sz} size={sz} variant="primary" />
          ))}
        </View>
      </Section>

      <Section title="States" note="Each row is a variant: default, disabled, loading.">
        {VARIANTS.map((v) => (
          <View key={v} style={styles.row}>
            <Button title={v} variant={v} />
            <Button title="Disabled" variant={v} disabled />
            <Button title="Loading" variant={v} loading />
          </View>
        ))}
        <Caption>Disabled: muted fill, dashed border, no shadow. Loading: keeps colour, drops the shadow, keeps its width.</Caption>
      </Section>

      <Section title="Icons">
        <View style={styles.row}>
          <Button title="Left" variant="primary" icon={<Dot />} />
          <Button title="Right" icon={<Dot />} iconPosition="right" />
          <Button title="Disabled" icon={<Dot />} disabled />
        </View>
      </Section>

      <Section title="Interactive">
        <View style={styles.row}>
          <Button title="Save changes" variant="primary" loading={saving} onPress={save} />
        </View>
        <Caption>Loading blocks further presses without a layout jump.</Caption>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Button
            title="A very long label that must not overflow its container"
            variant="primary"
            style={styles.stretch}
          />
        </View>
        <Caption>Long label in a 200pt container: truncates to one line.</Caption>
        <Button title="Stretch" variant="destructive" style={styles.stretch} />
        <Caption>Full width via the style prop (alignSelf: stretch).</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  lede: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingBottom: 4 },
  rowCenter: { alignItems: 'center' },
  narrow: { width: 200 },
  stretch: { alignSelf: 'stretch' },
  dot: { width: 12, height: 12, borderWidth: 2 },
});
