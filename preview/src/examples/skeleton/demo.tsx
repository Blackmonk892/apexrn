import { View } from 'react-native';
import { Skeleton } from '@/components/apexrn';

export default function SkeletonExample() {
  return (
    <View style={{ width: 300, gap: 12 }}>
      <Skeleton height={20} width="60%" />
      <Skeleton lines={3} />
    </View>
  );
}
