import { View } from 'react-native';
import { Slider } from '@/components/apexrn';

export default function SliderDisabledExample() {
  return (
    <View style={{ width: 300 }}>
      <Slider defaultValue={30} disabled showValue />
    </View>
  );
}
