import { View } from 'react-native';
import { Marquee } from '@/components/apexrn';

export default function MarqueeExample() {
  return (
    <View style={{ width: 320 }}>
      <Marquee text="Free shipping on orders over $50" />
    </View>
  );
}
