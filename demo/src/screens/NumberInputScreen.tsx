import React, { useState } from 'react';
import { NumberInput, Text as UIText } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function NumberInputScreen({ onBack }: { onBack: () => void }) {
  const [qty, setQty] = useState(2);
  const [price, setPrice] = useState(9.95);
  const [big, setBig] = useState(0);

  return (
    <Layout id="numberinput" title="NUMBER INPUT" onBack={onBack}>
      <Section title="Controlled" note="value + onValueChange. Hold a button to repeat; the interval shortens the longer you hold.">
        <UIText variant="mono" testID="numberinput-log">{`Value: ${qty}`}</UIText>
        <NumberInput label="Quantity" description="Between 0 and 20." value={qty} onValueChange={setQty} min={0} max={20} />
      </Section>

      <Section title="Fractional step" note="Steps of 0.05 stay exact; typed values snap to the step and clamp.">
        <NumberInput label="Price" value={price} onValueChange={setPrice} min={0} max={20} step={0.05} />
        <UIText variant="mono">{`Value: ${price}`}</UIText>
      </Section>

      <Section title="Uncontrolled, sizes" note="defaultValue keeps its own state.">
        <NumberInput size="sm" defaultValue={1} accessibilityLabel="Small" />
        <NumberInput size="md" defaultValue={5} min={0} max={10} accessibilityLabel="Medium" />
        <NumberInput size="lg" defaultValue={10} min={0} max={10} accessibilityLabel="Large" />
      </Section>

      <Section title="Invalid and disabled">
        <NumberInput label="Seats" required invalid errorMessage="Teams need at least 5 seats." defaultValue={2} min={0} />
        <NumberInput label="Locked" disabled defaultValue={7} />
      </Section>

      <Section title="Stress" note="Hold plus: 0 to 1000 in steps of 5 accelerates to a 40ms interval.">
        <UIText variant="mono">{`Value: ${big}`}</UIText>
        <NumberInput label="Throttle" value={big} onValueChange={setBig} min={0} max={1000} step={5} />
        <NumberInput label="Negative range" defaultValue={0} min={-3} max={3} />
      </Section>
    </Layout>
  );
}
