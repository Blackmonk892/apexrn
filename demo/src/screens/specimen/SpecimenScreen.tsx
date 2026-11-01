import { useContext } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { BackIcon, BrutalSurface, Text, useTheme, type PresetName } from '@apexrn/ui';
import { Quadrant } from './Quadrant';

const QUADRANTS: { preset: PresetName; mode: 'light' | 'dark' }[] = [
  { preset: 'neo', mode: 'light' },
  { preset: 'neo', mode: 'dark' },
  { preset: 'raw', mode: 'light' },
  { preset: 'raw', mode: 'dark' },
];

// Below this a quadrant gets too narrow for a colour row to keep its ratio on one line.
const GRID_MIN_WIDTH = 900;

export default function SpecimenScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // Read the context directly so the screen also renders outside the app's SafeAreaProvider (tests).
  const insets = useContext(SafeAreaInsetsContext);
  const grid = width >= GRID_MIN_WIDTH;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets?.top ?? 0, paddingBottom: insets?.bottom ?? 0 }}
    >
      <View style={styles.intro}>
        <BrutalSurface
          elevation="control"
          borderWidth="control"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to the component list"
          style={styles.back}
          surfaceStyle={styles.backSurface}
        >
          <BackIcon color={colors.foreground} size={20} />
          <Text variant="body">Home</Text>
        </BrutalSurface>
        <Text variant="display">Specimen</Text>
        <Text variant="body" tone="muted" style={styles.lede}>
          Every token in both presets and both schemes. Values here are the ones the library ships.
        </Text>
      </View>

      <View style={grid ? styles.grid : undefined}>
        {QUADRANTS.map((q) => (
          <Quadrant key={`${q.preset}-${q.mode}`} {...q} style={grid ? styles.half : undefined} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  intro: { padding: 16, paddingBottom: 32, gap: 12 },
  back: { alignSelf: 'flex-start', marginBottom: 12 },
  backSurface: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 12 },
  lede: { maxWidth: 560 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  half: { width: '50%' },
});
