import { View } from 'react-native';
import { Textarea } from '@/components/apexrn';

export default function TextareaExample() {
  return (
    <View style={{ width: 300 }}>
      <Textarea label="Bio" placeholder="Tell us about you" minRows={3} maxRows={6} />
    </View>
  );
}
