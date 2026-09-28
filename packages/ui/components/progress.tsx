import { useEffect } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal_surface';

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
export default function Progress({
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
  const safeValue = (clampedValue / clampedMax) * 100;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(safeValue, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [safeValue, progress]);

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

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
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    height: PROGRESS_HEIGHT,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 0,
  },
});
