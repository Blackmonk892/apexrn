import { View } from 'react-native';
import { Textarea } from '@/components/apexrn';

export default function TextareaDisabledExample() {
  return (
    <View style={{ width: 300 }}>
      <Textarea label="Notes" defaultValue="Locked while the order is shipping." disabled minRows={2} />
    </View>
  );
}
