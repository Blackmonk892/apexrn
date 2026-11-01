import { View } from 'react-native';
import { Label } from '@/components/apexrn';

export default function LabelRequiredExample() {
  return (
    <View style={{ gap: 12 }}>
      <Label required>Email</Label>
      <Label disabled>Billing address</Label>
    </View>
  );
}
