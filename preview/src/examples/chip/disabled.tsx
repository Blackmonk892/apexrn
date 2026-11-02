import { View } from 'react-native';
import { Chip } from '@/components/apexrn';

export default function ChipDisabledExample() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Chip label="Sold out" disabled />
      <Chip label="Members only" selected disabled />
    </View>
  );
}
