import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { borderWidths, spacing } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface ProgressProps extends Omit<ViewProps, 'style'> {
  /** Current value. Leave undefined for an indeterminate bar. */
  value?: number;
  /** Value at which the bar is full. @default 100 */
  max?: number;
  /** Text above the track; also the accessibility label. */
  label?: string;
  /** Style for the outer wrapper. */
  style?: StyleProp<ViewStyle>;
}

const TRACK_HEIGHT = 24;
const BLOCKS = 3;
// Slow enough to read as a step on a 24px track; faster looks like flicker.
const STEP_MS = 400;

function Block({ index, last, step, still }: { index: number; last: boolean; step: SharedValue<number>; still: boolean }) {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => ({
    opacity: still || Math.floor(step.value) === index ? 1 : 0,
  }));
  return (
    <View style={[styles.cell, !last && { borderRightWidth: borderWidths.control, borderColor: colors.border }]}>
      <Animated.View testID="progress-block" style={[styles.fill, { backgroundColor: colors.foreground }, style]} />
    </View>
  );
}

export function Progress({ value, max = 100, label, style, ...props }: ProgressProps) {
  const { colors } = useTheme();
  const { reduceMotion, enter } = useMotion();
  const determinate = value !== undefined;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const clamped = determinate && Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : 0;
  const ratio = clamped / safeMax;

  const progress = useSharedValue(ratio);
  const step = useSharedValue(0);

  useEffect(() => {
    progress.value = reduceMotion ? ratio : withTiming(ratio, enter);
  }, [ratio, reduceMotion, enter, progress]);

  useEffect(() => {
    if (determinate || reduceMotion) return;
    step.value = withRepeat(withTiming(BLOCKS, { duration: STEP_MS * BLOCKS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(step);
  }, [determinate, reduceMotion, step]);

  // scaleX from the left edge rather than animating width, so the fill never triggers layout.
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
    transformOrigin: 'left center',
  }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Progress'}
      accessibilityValue={determinate ? { min: 0, max: safeMax, now: clamped } : undefined}
      accessibilityState={determinate ? undefined : { busy: true }}
      style={[styles.root, { gap: spacing.sm }, style]}
      {...props}
    >
      {label || determinate ? (
        <View style={[styles.header, { gap: spacing.md }]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {label ? <Text variant="label">{label}</Text> : <View />}
          {determinate ? (
            <Text variant="mono" testID="progress-percent">{`${Math.round(ratio * 100)}%`}</Text>
          ) : null}
        </View>
      ) : null}
      <BrutalSurface
        elevation="flat"
        borderWidth="container"
        pressable={false}
        surfaceStyle={[styles.track, { backgroundColor: colors.background }]}
      >
        {determinate ? (
          <Animated.View
            testID="progress-fill"
            style={[styles.fill, { backgroundColor: colors.foreground }, fillStyle]}
          />
        ) : (
          <View style={styles.blocks}>
            {Array.from({ length: BLOCKS }, (_, i) => (
              <Block key={i} index={i} last={i === BLOCKS - 1} step={step} still={reduceMotion} />
            ))}
          </View>
        )}
      </BrutalSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: TRACK_HEIGHT, overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  blocks: { flex: 1, flexDirection: 'row' },
  cell: { flex: 1 },
});

export default Progress;
