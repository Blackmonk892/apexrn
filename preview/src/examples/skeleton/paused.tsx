import { View } from 'react-native';
import { Skeleton } from '@/components/apexrn';

export default function SkeletonPausedExample() {
  return (
    <View style={{ width: 300 }}>
      <Skeleton lines={3} paused />
    </View>
  );
}
