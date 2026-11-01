import { View } from 'react-native';
import { NumberInput } from '@/components/apexrn';

export default function NumberInputInvalidExample() {
  return (
    <View style={{ width: 220 }}>
      <NumberInput label="Guests" defaultValue={0} min={0} invalid errorMessage="Add at least one guest" />
    </View>
  );
}
