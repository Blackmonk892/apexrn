import { View } from 'react-native';
import { Alert } from '@/components/apexrn';

export default function AlertExample() {
  return (
    <View style={{ width: 320 }}>
      <Alert title="Storage almost full" description="You have used 92% of your 5 GB." variant="warning" />
    </View>
  );
}
