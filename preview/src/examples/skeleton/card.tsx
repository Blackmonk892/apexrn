import { View } from 'react-native';
import { Skeleton } from '@/components/apexrn';

export default function SkeletonCardExample() {
  return (
    <View style={{ width: 300, flexDirection: 'row', gap: 12 }}>
      <Skeleton width={56} height={56} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton height={16} width="50%" />
        <Skeleton height={14} />
        <Skeleton height={14} width="80%" />
      </View>
    </View>
  );
}
