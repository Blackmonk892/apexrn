import { View } from 'react-native';
import { Button } from '@/components/apexrn';

export default function ButtonDisabledExample() {
  return (
    <View style={{ gap: 12, alignItems: 'center' }}>
      <Button disabled>Save changes</Button>
      <Button variant="outline" disabled>
        Cancel
      </Button>
    </View>
  );
}
