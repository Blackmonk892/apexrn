import { View } from 'react-native';
import { Checkbox } from '@/components/apexrn';

export default function CheckboxStatesExample() {
  return (
    <View style={{ gap: 12 }}>
      <Checkbox label="Email me about new features" />
      <Checkbox label="Select all" checked="indeterminate" />
      <Checkbox label="Accept the terms" defaultChecked />
      <Checkbox label="Share usage data" disabled />
    </View>
  );
}
