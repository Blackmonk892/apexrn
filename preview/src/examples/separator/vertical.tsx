import { View } from 'react-native';
import { Separator, Text } from '@/components/apexrn';

export default function SeparatorVerticalExample() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 24 }}>
      <Text>Docs</Text>
      <Separator orientation="vertical" />
      <Text>Pricing</Text>
      <Separator orientation="vertical" />
      <Text>Blog</Text>
    </View>
  );
}
