import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RadioGroup, RadioGroupItem, Text } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function RadioGroupScreen({ onBack }: { onBack: () => void }) {
  const [shipping, setShipping] = useState('standard');
  const [plan, setPlan] = useState('monthly');

  return (
    <Layout id="radiogroup" title="RADIO GROUP" onBack={onBack}>
      <Section title="Variants" note="The selected item holds a filled square inside the box. A checkbox gets a check, so the two never read alike.">
        <RadioGroup value={shipping} onValueChange={setShipping} accessibilityLabel="Shipping">
          <RadioGroupItem value="standard" label="Standard, 3 to 5 days" testID="radio-standard" />
          <RadioGroupItem value="express" label="Express, next day" testID="radio-express" />
          <RadioGroupItem value="pickup" label="Pick up in store" testID="radio-pickup" />
        </RadioGroup>
        <Text variant="mono" testID="radiogroup-log">{`Shipping: ${shipping}`}</Text>
      </Section>

      <Section title="States" note="Uncontrolled with a default, nothing selected, one item disabled, and a whole group disabled.">
        <RadioGroup defaultValue="monthly" accessibilityLabel="Billing period">
          <RadioGroupItem value="monthly" label="Monthly" />
          <RadioGroupItem value="yearly" label="Yearly" />
        </RadioGroup>
        <RadioGroup accessibilityLabel="Theme">
          <RadioGroupItem value="light" label="Light" />
          <RadioGroupItem value="dark" label="Dark" />
        </RadioGroup>
        <RadioGroup defaultValue="email" accessibilityLabel="Contact method">
          <RadioGroupItem value="email" label="Email" />
          <RadioGroupItem value="phone" label="Phone, unavailable on this plan" disabled />
        </RadioGroup>
        <RadioGroup defaultValue="admin" disabled accessibilityLabel="Role">
          <RadioGroupItem value="admin" label="Admin" />
          <RadioGroupItem value="member" label="Member" />
        </RadioGroup>
      </Section>

      <Section title="In context">
        <View style={styles.context}>
          <Text variant="title">Choose a plan</Text>
          <RadioGroup value={plan} onValueChange={setPlan} accessibilityLabel="Plan">
            <RadioGroupItem value="monthly" label="Monthly, 12 USD" />
            <RadioGroupItem value="yearly" label="Yearly, 96 USD" />
          </RadioGroup>
        </View>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <RadioGroup defaultValue="long" accessibilityLabel="Delivery notes">
            <RadioGroupItem value="long" label="Leave the parcel with a neighbour if nobody answers the door within five minutes" />
          </RadioGroup>
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  context: { gap: 12 },
  narrow: { width: 260 },
});
