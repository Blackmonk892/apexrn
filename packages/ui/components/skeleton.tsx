import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  Easing 
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SkeletonProps extends ViewProps {
  /**
   * Optional flag to pause the animation.
   * Useful for respecting reduced motion preferences.
   * @default false
   */
  paused?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
// Maintained for strict template compliance, though unused by the Skeleton.
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Skeleton({
  paused = false,
  style,
  ...props
}: SkeletonProps) {
  const position = useSharedValue(-100);

  useEffect(() => {
    if (paused) {
      position.value = -100;
      return;
    }
    
    // Creates a harsh, bouncing linear sweep back and forth
    position.value = withRepeat(
      withTiming(100, { 
        duration: 900, 
        easing: Easing.linear 
      }),
      -1, // infinite loop
      true // reverse direction on each cycle
    );
  }, [paused, position]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: `${position.value}%`,
    };
  });

  return (
    <View
      style={cn(styles.base, style)}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      accessibilityState={{ busy: true }}
      {...props}
    >
      <Animated.View style={[styles.swipe, animatedStyle]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.light.muted,
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard,
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    // Default fallback dimensions in case it isn't flexed or sized by the parent
    minHeight: spacing.xl,
    minWidth: '100%',
  },
  swipe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: colors.light.mutedForeground, 
    opacity: 0.3, // High-contrast harsh block rather than a soft gradient mask
    borderRadius: 0,
  },
});