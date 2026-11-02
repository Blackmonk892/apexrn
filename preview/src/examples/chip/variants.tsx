import { View } from 'react-native';
import { Chip } from '@/components/apexrn';

export default function ChipVariantsExample() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: 300 }}>
      <Chip label="Draft" />
      <Chip variant="success" label="Published" />
      <Chip variant="warning" label="Needs review" />
      <Chip variant="destructive" label="Rejected" />
    </View>
  );
}
