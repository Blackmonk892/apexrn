import { View } from 'react-native';
import { Text } from '@/components/apexrn';

export default function TextExample() {
  return (
    <View style={{ width: 300, gap: 4 }}>
      <Text variant="title">Orders</Text>
      <Text tone="muted">Shipped this week</Text>
    </View>
  );
}
