import { View } from 'react-native';
import { Marquee } from '@/components/apexrn';

export default function MarqueeDividerExample() {
  return (
    <View style={{ width: 320 }}>
      <Marquee text="Sale ends Sunday" divider="  //  " speed={30} />
    </View>
  );
}
