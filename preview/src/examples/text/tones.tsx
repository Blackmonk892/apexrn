import { View } from 'react-native';
import { Text } from '@/components/apexrn';

export default function TextTonesExample() {
  return (
    <View style={{ gap: 8 }}>
      <Text>Default tone</Text>
      <Text tone="muted">Muted tone for secondary text</Text>
    </View>
  );
}
