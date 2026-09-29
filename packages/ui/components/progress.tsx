import { useEffect } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ProgressProps extends ViewProps {
  /**
   * The current progress value.
   * @default 0
   */
  value?: number;
  /**
   * The maximum progress value.
   * @default 100
   */
  max?: number;
  /**
   * Toggles the Brutalist 4px hard shadow behind the track.
   * @default false
   */
  withShadow?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
const PROGRESS_HEIGHT = 24;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Progress({
  value = 0,
  max = 100,
  withShadow = false,
  style,
  ...props
}: ProgressProps) {
  const { colors } = useTheme();
  const clampedMax = Number.isFinite(max) && max > 0 ? max : 100;
  const clampedValue = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), clampedMax)
    : 0;
  const ratio = clampedValue / clampedMax;
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = reduceMotion
      ? ratio
      : withTiming(ratio, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [ratio, reduceMotion, progress]);

  // scaleX from the left edge instead of animating `width`: transform-only,
  // so the fill never triggers a layout pass.
  const animatedFillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
    transformOrigin: 'left center',
  }));

  return (
    <BrutalSurface
      style={[styles.container, style]}
      surfaceStyle={[styles.track, { backgroundColor: colors.background }]}
      offset={SHADOW_OFFSET}
      borderWidth="heavy"
      pressable={false}
      hasShadow={withShadow}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: clampedMax, now: clampedValue }}
      accessible
      {...props}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.foreground }, animatedFillStyle]} />
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // stretch (not width: 100%) so the shadow's margin doesn't push past the parent.
  container: {
    alignSelf: 'stretch',
  },
  track: {
    width: '100%',
    height: PROGRESS_HEIGHT,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
});

export default Progress;
