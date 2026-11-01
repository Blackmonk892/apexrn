import { View } from 'react-native';
import { Progress } from '@/components/apexrn';

export default function ProgressIndeterminateExample() {
  return (
    <View style={{ width: 300 }}>
      <Progress label="Syncing" />
    </View>
  );
}
