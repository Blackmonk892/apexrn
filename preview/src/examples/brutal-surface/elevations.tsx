import { View } from 'react-native';
import { BrutalSurface, Text } from '@/components/apexrn';

export default function BrutalSurfaceElevationsExample() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, width: 300 }}>
      {(['flat', 'control', 'card', 'overlay'] as const).map((elevation) => (
        <BrutalSurface key={elevation} elevation={elevation} surfaceStyle={{ padding: 16 }}>
          <Text variant="label">{elevation}</Text>
        </BrutalSurface>
      ))}
    </View>
  );
}
