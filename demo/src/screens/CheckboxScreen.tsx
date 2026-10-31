import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, Text, spacing } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const TOPPINGS = ['Capers', 'Anchovies', 'Roasted peppers'];

export default function CheckboxScreen({ onBack }: { onBack: () => void }) {
  const [terms, setTerms] = useState(false);
  const [log, setLog] = useState('none');
  const [picked, setPicked] = useState<boolean[]>([true, false, false]);

  const count = picked.filter(Boolean).length;
  const all: boolean | 'indeterminate' = count === TOPPINGS.length ? true : count === 0 ? false : 'indeterminate';
  const setAll = (next: boolean) => setPicked(TOPPINGS.map(() => next));

  return (
    <Layout id="checkbox" title="CHECKBOX" onBack={onBack}>
      <Text>Tap the box or its label. Selected is an inverted block; a partial selection shows a bar.</Text>

      <Section title="Variants" note="Controlled, uncontrolled and indeterminate.">
        <Checkbox
          testID="checkbox-terms"
          label="Accept the terms of service"
          checked={terms}
          onCheckedChange={(next) => {
            setTerms(next);
            setLog(`Checked: ${next}`);
          }}
        />
        <Checkbox label="Email me a receipt" defaultChecked onCheckedChange={(next) => setLog(`Receipt: ${next}`)} />
        <Checkbox label="Select all toppings" checked="indeterminate" />
        <Caption>{`Last change: ${log}`}</Caption>
      </Section>

      <Section title="States" note="Disabled keeps its dashed border and its fill; it just stops responding.">
        <View style={styles.cell}>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Indeterminate" defaultChecked="indeterminate" />
        </View>
        <View style={styles.cell}>
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled, checked" disabled defaultChecked />
          <Checkbox label="Disabled, indeterminate" disabled defaultChecked="indeterminate" />
        </View>
      </Section>

      <Section title="In context" note="The parent box reflects its children and selects or clears all of them.">
        <Checkbox label="All toppings" checked={all} onCheckedChange={setAll} />
        <View style={styles.children}>
          {TOPPINGS.map((name, i) => (
            <Checkbox
              key={name}
              label={name}
              checked={picked[i]}
              onCheckedChange={(next) => setPicked((prev) => prev.map((v, j) => (j === i ? next : v)))}
            />
          ))}
        </View>
        <Caption>{`${count} of ${TOPPINGS.length} selected`}</Caption>
      </Section>

      <Section title="Edge cases" note="A long label wraps beside the box and never runs under it.">
        <View style={styles.narrow}>
          <Checkbox label="I have read the privacy policy, the cookie notice and the data processing addendum" />
        </View>
        <Checkbox accessibilityLabel="Remember this device" defaultChecked />
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  cell: { gap: spacing.xs },
  children: { paddingLeft: spacing.xl, gap: spacing.xs },
  narrow: { width: 280 },
});
