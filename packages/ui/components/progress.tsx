import React, { useEffect } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { colors } from '../lib/colors';
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
// A standard chunky height for brutalist linear indicators
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
  // Clamp the progress between 0 and 100 percentage points
  const safeValue = Math.min(Math.max((value / max) * 100, 0), 100);
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
      surfaceStyle={styles.track}
      offset={SHADOW_OFFSET}
      borderWidth="heavy"
      pressable={false}
      hasShadow={withShadow}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      {...props}
    >
      <Animated.View style={[styles.fill, animatedFillStyle]} />
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
    backgroundColor: colors.light.background,
    overflow: 'hidden', // Ensures the fill never spills out
  },
  fill: {
    height: '100%',
    backgroundColor: colors.light.foreground,
    borderRadius: 0, // Strict butt caps, no rounding
  },
});
