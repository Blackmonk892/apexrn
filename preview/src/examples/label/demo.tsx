import { View } from 'react-native';
import { Input, Label } from '@/components/apexrn';

export default function LabelExample() {
  return (
    <View style={{ width: 300, gap: 8 }}>
      <Label>Display name</Label>
      <Input placeholder="Ada Lovelace" />
    </View>
  );
}
