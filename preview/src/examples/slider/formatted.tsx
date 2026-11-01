import { View } from 'react-native';
import { Slider } from '@/components/apexrn';

export default function SliderFormattedExample() {
  return (
    <View style={{ width: 300 }}>
      <Slider
        defaultValue={250}
        min={0}
        max={1000}
        step={50}
        showValue
        formatValue={(value) => `$${value}`}
      />
    </View>
  );
}
