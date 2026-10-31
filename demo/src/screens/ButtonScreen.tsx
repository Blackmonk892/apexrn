import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, CheckIcon, Text, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'warning'] as const;
const LABELS = {
  primary: 'Save changes',
  secondary: 'Add to cart',
  outline: 'Cancel',
  ghost: 'Skip for now',
  destructive: 'Delete account',
  success: 'Mark as paid',
  warning: 'Replace file',
} as const;
const SIZES = ['sm', 'md', 'lg'] as const;

export default function ButtonScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState('none');
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const save = () => {
    setSaving(true);
    timer.current = setTimeout(() => setSaving(false), 1500);
  };

  return (
    <Layout id="button" title="BUTTON" onBack={onBack}>
      <Text>Press a button to feel it sink into its shadow. Every cell below is the real component.</Text>

      <Section title="Variants" note="Destructive, success and warning carry an icon as well as colour.">
        <View style={styles.row}>
          {VARIANTS.map((v) => (
            <Button key={v} testID={`button-${v}`} variant={v} onPress={() => setPressed(v)}>
              {LABELS[v]}
            </Button>
          ))}
        </View>
        <Caption>{`Pressed: ${pressed}`}</Caption>
      </Section>

      <Section title="Sizes" note="Heights 40, 48 and 56. Small buttons extend their hit area to the platform touch target.">
        <View style={[styles.row, styles.rowCenter]}>
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              {`Size ${size}`}
            </Button>
          ))}
        </View>
      </Section>

      <Section title="States" note="Idle, disabled and loading for every variant. Loading keeps the width and the live look.">
        {VARIANTS.map((v) => (
          <View key={v} style={styles.row}>
            <Button variant={v}>{LABELS[v]}</Button>
            <Button variant={v} disabled>{LABELS[v]}</Button>
            <Button variant={v} loading>{LABELS[v]}</Button>
          </View>
        ))}
      </Section>

      <Section title="In context">
        <View style={styles.row}>
          <Button variant="primary" loading={saving} onPress={save}>Save changes</Button>
          <Button variant="outline" disabled={saving}>Discard</Button>
          <Button variant="ghost" icon={<CheckIcon size={20} color={colors.foreground} />} iconPosition="right">Review</Button>
        </View>
        <Caption>Saving swaps the label for blocks without a layout jump, and Discard locks until it finishes.</Caption>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Button style={styles.stretch}>Export every invoice from the last fiscal year</Button>
        </View>
        <Caption>A long label in a 200 wide container truncates to one line.</Caption>
        <View style={styles.narrow320}>
          <Button variant="destructive" style={styles.stretch}>Delete all 1,204 files</Button>
        </View>
        <Caption>Full width at 320 through the style prop.</Caption>
        <View style={styles.row}>
          <Button icon={<CheckIcon size={20} color={colors.primaryForeground} />} accessibilityLabel="Confirm" />
          <Button variant="outline" icon={<CheckIcon size={20} color={colors.foreground} />} accessibilityLabel="Confirm" size="sm" />
        </View>
        <Caption>Icon only, labelled for screen readers.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingBottom: 4 },
  rowCenter: { alignItems: 'center' },
  narrow: { width: 200 },
  narrow320: { width: 320, maxWidth: '100%' },
  stretch: { alignSelf: 'stretch' },
});
