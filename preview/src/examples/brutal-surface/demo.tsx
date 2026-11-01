import { Text } from 'react-native';
import { BrutalSurface } from '@/components/apexrn';

export default function BrutalSurfaceExample() {
  return (
    <BrutalSurface
      pressable
      onPress={() => {}}
      accessibilityRole="button"
      accessibilityLabel="Open tile"
      style={{ width: 200 }}
      surfaceStyle={{ padding: 16 }}
    >
      <Text>Tap to press</Text>
    </BrutalSurface>
  );
}
