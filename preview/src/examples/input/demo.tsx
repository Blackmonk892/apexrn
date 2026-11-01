import { View } from 'react-native';
import { Input } from '@/components/apexrn';

export default function InputExample() {
  return (
    <View style={{ width: 300 }}>
      <Input label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
    </View>
  );
}
