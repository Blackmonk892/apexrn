import { View } from 'react-native';
import { NumberInput } from '@/components/apexrn';

export default function NumberInputStepExample() {
  return (
    <View style={{ width: 220 }}>
      <NumberInput label="Budget" description="In steps of 50" defaultValue={200} min={0} max={1000} step={50} />
    </View>
  );
}
