import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RadioGroup, RadioGroupItem, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

function Option({ value, label, disabled }: { value: string; label: string; disabled?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <RadioGroupItem value={value} disabled={disabled} accessibilityLabel={label} />
      <Text style={[styles.rowText, { color: disabled ? colors.mutedForeground : colors.foreground }]}>{label}</Text>
    </View>
  );
}

export default function RadioGroupScreen({ onBack }: { onBack: () => void }) {
  const [flavor, setFlavor] = useState('vanilla');
  const [plan, setPlan] = useState('none');

  return (
    <Layout title="RADIO GROUP" onBack={onBack}>
      <Section title="Controlled" note="value + onValueChange. Selection is a filled dot, not just colour.">
        <RadioGroup value={flavor} onValueChange={setFlavor}>
          <Option value="vanilla" label="Vanilla" />
          <Option value="chocolate" label="Chocolate" />
          <Option value="strawberry" label="Strawberry" />
        </RadioGroup>
        <Caption>{`Selected: ${flavor}`}</Caption>
      </Section>

      <Section title="Uncontrolled" note="defaultValue keeps its own state; nothing is selected without one.">
        <RadioGroup defaultValue="monthly" onValueChange={setPlan}>
          <Option value="monthly" label="Monthly" />
          <Option value="yearly" label="Yearly" />
        </RadioGroup>
        <Caption>{`Last change: ${plan}`}</Caption>
        <RadioGroup>
          <Option value="a" label="No default selected" />
          <Option value="b" label="Another option" />
        </RadioGroup>
      </Section>

      <Section title="Disabled" note="Disable one item, or the whole group with disabled on RadioGroup.">
        <RadioGroup defaultValue="one">
          <Option value="one" label="Available" />
          <Option value="two" label="Unavailable item" disabled />
        </RadioGroup>
        <RadioGroup defaultValue="x" disabled>
          <Option value="x" label="Whole group disabled (selected)" disabled />
          <Option value="y" label="Whole group disabled" disabled />
        </RadioGroup>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <RadioGroup defaultValue="long">
            <Option value="long" label="An option label long enough to wrap in a narrow column" />
          </RadioGroup>
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowText: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  narrow: { width: 260 },
});
