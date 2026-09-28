import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from 'react-native';
import Animated, {
  cancelAnimation,
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
  const position = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (paused || containerWidth <= 0) {
      cancelAnimation(position);
      return;
    }

    // Sweep the 40%-wide highlight from fully off-screen-left to
    // fully off-screen-right. `translateX` (compositor) instead of `left`
    // (layout) so the shimmer doesn't thrash layout every frame.
    position.value = -containerWidth;
    position.value = withRepeat(
      withTiming(containerWidth, {
        duration: 900,
        easing: Easing.linear
      }),
      -1,
      false
    );
  }, [paused, containerWidth, position]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: position.value }],
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== containerWidth) {
      setContainerWidth(w);
    }
  };

  return (
    <View
      style={cn(styles.base, { backgroundColor: colors.muted, borderColor: colors.border }, style)}
      onLayout={handleLayout}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      accessibilityState={{ busy: !paused }}
      {...props}
    >
      {!paused && (
        <Animated.View style={[styles.swipe, { backgroundColor: colors.mutedForeground }, animatedStyle]} />
      )}
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
    width: '100%',
  },
  swipe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '40%',
    opacity: 0.5,
    borderRadius: 0,
  },
});