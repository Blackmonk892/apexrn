import React, { useEffect } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

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
    <View 
      style={cn(
        styles.container, 
        withShadow && styles.containerWithShadow,
        style
      )}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      {...props}
    >
      {withShadow && <View style={styles.shadow} />}
      
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedFillStyle]} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  containerWithShadow: {
    // Reserve space so the shadow doesn't clip into adjacent layout elements
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    height: PROGRESS_HEIGHT,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  track: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    height: PROGRESS_HEIGHT,
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy, // Thick-bordered empty box as requested
    borderRadius: 0,
    overflow: 'hidden', // Ensures the fill never spills out
  },
  fill: {
    height: '100%',
    backgroundColor: colors.light.foreground,
    borderRadius: 0, // Strict butt caps, no rounding
  },
});