import { View } from 'react-native';
import { Text } from '@/components/apexrn';

export default function TextVariantsExample() {
  return (
    <View style={{ width: 300, gap: 8 }}>
      <Text variant="display">Display</Text>
      <Text variant="title">Title</Text>
      <Text variant="strong">Strong</Text>
      <Text variant="body">Body text for paragraphs and descriptions.</Text>
      <Text variant="label">Label</Text>
      <Text variant="mono">$1,240.00</Text>
    </View>
  );
}
