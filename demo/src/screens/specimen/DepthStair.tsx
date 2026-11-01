import { StyleSheet, View } from 'react-native';
import { BrutalSurface, Text, borderWidths, useTheme, type Elevation } from '@apexrn/ui';

const STEPS: (keyof Elevation)[] = ['flat', 'control', 'card', 'overlay'];
const BORDERS: (keyof typeof borderWidths)[] = ['control', 'container'];

// Block height grows with the depth itself, not the step's rank, so raw's
// identical 2px steps read as one flat run next to neo's climb.
const BASE_HEIGHT = 48;
const HEIGHT_PER_PX = 8;

export function DepthStair() {
  const { colors, elevation } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.borders}>
        {BORDERS.map((key) => (
          <View key={key} style={styles.column}>
            <BrutalSurface
              pressable={false}
              elevation="flat"
              borderWidth={key}
              backgroundColor={colors.surface}
              surfaceStyle={styles.borderBlock}
            />
            <Text variant="mono" tone="muted">border {key}</Text>
            <Text variant="mono">{borderWidths[key]}px</Text>
          </View>
        ))}
      </View>

      <View style={styles.stair}>
        {STEPS.map((key) => (
          <View key={key} style={styles.column}>
            <BrutalSurface
              pressable={false}
              elevation={key}
              backgroundColor={colors.surface}
              surfaceStyle={{ height: BASE_HEIGHT + elevation[key] * HEIGHT_PER_PX }}
            />
            <Text variant="mono" tone="muted" numberOfLines={1}>{key}</Text>
            <Text variant="mono" testID={`depth-${key}`}>{elevation[key]}px</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 24 },
  borders: { flexDirection: 'row', gap: 16 },
  borderBlock: { height: 40 },
  stair: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  column: { flex: 1, minWidth: 0, gap: 4 },
});
