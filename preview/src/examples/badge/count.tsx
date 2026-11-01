import { View } from 'react-native';
import { Badge } from '@/components/apexrn';

export default function BadgeCountExample() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Badge variant="primary" count={3} />
      <Badge variant="primary" count={42} />
      <Badge variant="primary" count={120} max={99} />
    </View>
  );
}
