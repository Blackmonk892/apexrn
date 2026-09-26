import React, { useEffect } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  Easing 
} from 'react-native-reanimated';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SkeletonProps extends ViewProps {
  /**
   * Optional flag to pause the animation.
   * @default false
   */
  paused?: boolean;
  style?: any;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Skeleton({
  paused = false,
  style,
  ...props
}: SkeletonProps) {
  const { colors } = useTheme();
  const position = useSharedValue(-100);

  useEffect(() => {
    if (paused) {
      position.value = -100;
      return;
    }
    
    position.value = withRepeat(
      withTiming(100, { 
        duration: 900, 
        easing: Easing.linear 
      }),
      -1,
      true
    );
  }, [paused, position]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: `${position.value}%`,
    };
  });

  return (
    <View
      style={cn(styles.base, { backgroundColor: colors.muted, borderColor: colors.border }, style)}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      accessibilityState={{ busy: true }}
      {...props}
    >
      <Animated.View style={[styles.swipe, { backgroundColor: colors.mutedForeground }, animatedStyle]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  base: {
    borderWidth: borderWidths.standard,
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    minHeight: spacing.xl,
    minWidth: '100%',
  },
  swipe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%',
    opacity: 0.3,
    borderRadius: 0,
  },
});