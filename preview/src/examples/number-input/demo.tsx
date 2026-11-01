import { useState } from 'react';
import { View } from 'react-native';
import { NumberInput } from '@/components/apexrn';

export default function NumberInputExample() {
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={{ width: 220 }}>
      <NumberInput label="Quantity" value={quantity} onValueChange={setQuantity} min={1} max={10} />
    </View>
  );
}
