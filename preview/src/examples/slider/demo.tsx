import { useState } from 'react';
import { View } from 'react-native';
import { Slider } from '@/components/apexrn';

export default function SliderExample() {
  const [volume, setVolume] = useState(40);

  return (
    <View style={{ width: 300 }}>
      <Slider value={volume} onValueChange={setVolume} min={0} max={100} step={5} showValue />
    </View>
  );
}
