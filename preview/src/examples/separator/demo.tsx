import { View } from 'react-native';
import { Separator, Text } from '@/components/apexrn';

export default function SeparatorExample() {
  return (
    <View style={{ width: 300, gap: 12 }}>
      <Text variant="strong">Account</Text>
      <Separator />
      <Text tone="muted">Manage your profile and sign-in.</Text>
    </View>
  );
}
