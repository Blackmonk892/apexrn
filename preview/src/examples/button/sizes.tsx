import { View } from 'react-native';
import { Button } from '@/components/apexrn';

export default function ButtonSizesExample() {
  return (
    <View style={{ gap: 12, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </View>
  );
}
