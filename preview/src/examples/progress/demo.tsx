import { View } from 'react-native';
import { Progress } from '@/components/apexrn';

export default function ProgressExample() {
  return (
    <View style={{ width: 300 }}>
      <Progress label="Uploading report.pdf" value={60} max={100} />
    </View>
  );
}
