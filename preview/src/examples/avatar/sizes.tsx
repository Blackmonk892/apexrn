import { View } from 'react-native';
import { Avatar } from '@/components/apexrn';

export default function AvatarSizesExample() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Grace Hopper" size="md" />
      <Avatar name="Alan Turing" size="lg" />
    </View>
  );
}
