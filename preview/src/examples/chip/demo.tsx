import { View } from 'react-native';
import { Chip } from '@/components/apexrn';

export default function ChipExample() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: 300 }}>
      <Chip label="Open now" defaultSelected />
      <Chip label="Pet friendly" />
      <Chip label="Outdoor seating" />
    </View>
  );
}
