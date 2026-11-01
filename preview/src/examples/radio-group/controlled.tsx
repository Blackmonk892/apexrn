import { useState } from 'react';
import { View } from 'react-native';
import { RadioGroup, RadioGroupItem, Text } from '@/components/apexrn';

export default function RadioGroupControlledExample() {
  const [size, setSize] = useState('m');

  return (
    <View style={{ gap: 12 }}>
      <RadioGroup value={size} onValueChange={setSize}>
        <RadioGroupItem value="s" label="Small" />
        <RadioGroupItem value="m" label="Medium" />
        <RadioGroupItem value="l" label="Large" />
      </RadioGroup>
      <Text variant="mono" tone="muted">{`Selected: ${size}`}</Text>
    </View>
  );
}
