import { View } from 'react-native';
import { Input } from '@/components/apexrn';

export default function InputSizesExample() {
  return (
    <View style={{ width: 300, gap: 12 }}>
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </View>
  );
}
