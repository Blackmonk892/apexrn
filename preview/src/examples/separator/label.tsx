import { View } from 'react-native';
import { Button, Separator } from '@/components/apexrn';

export default function SeparatorLabelExample() {
  return (
    <View style={{ width: 300, gap: 12 }}>
      <Button>Continue with email</Button>
      <Separator label="or" />
      <Button variant="outline">Continue with Google</Button>
    </View>
  );
}
