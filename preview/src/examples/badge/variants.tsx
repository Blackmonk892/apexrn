import { View } from 'react-native';
import { Badge } from '@/components/apexrn';

export default function BadgeVariantsExample() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: 300 }}>
      <Badge label="Draft" />
      <Badge variant="primary" label="New" />
      <Badge variant="outline" label="Beta" />
      <Badge variant="accent" label="Pro" />
      <Badge variant="success" label="Live" />
      <Badge variant="warning" label="Review" />
      <Badge variant="destructive" label="Failed" />
    </View>
  );
}
