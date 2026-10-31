import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';

export interface SkeletonProps extends Omit<ViewProps, 'style'> {
  /** Block width. @default '100%' */
  width?: DimensionValue;
  /** Block height; for `lines`, the height of each line. @default 24 for a block, 16 for lines */
  height?: number;
  /** Render this many text lines instead of one block; the last is 60% wide. */
  lines?: number;
  /** Stop the sweep. Also stopped by the OS reduce-motion setting. @default false */
  paused?: boolean;
  /** Style for the outer node. */
  style?: StyleProp<ViewStyle>;
}

const BAND_RATIO = 0.4;
// The band jumps in discrete steps rather than gliding, which keeps it hard-edged in time as well as in space.
const SWEEP_STEPS = 10;
const SWEEP_MS = 1200;
// Low enough that the band reads as a highlight on `muted`, not as content.
const BAND_OPACITY = 0.25;
const LAST_LINE_WIDTH = '60%';

function Block({ style, paused, testID }: { style?: StyleProp<ViewStyle>; paused: boolean; testID?: string }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const animated = !paused && !reduceMotion;
  const progress = useSharedValue(0);
  const width = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;
    progress.value = 0;
    progress.value = withRepeat(withTiming(1, { duration: SWEEP_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(progress);
  }, [animated, progress]);

  // translateX rather than left, so the sweep never triggers layout.
  const bandStyle = useAnimatedStyle(() => {
    const step = Math.floor(progress.value * SWEEP_STEPS) / SWEEP_STEPS;
    return { transform: [{ translateX: -width.value * BAND_RATIO + step * width.value * (1 + BAND_RATIO) }] };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    width.value = e.nativeEvent.layout.width;
  };

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      style={[styles.block, { backgroundColor: colors.muted, borderColor: colors.border }, style]}
    >
      {animated ? (
        <Animated.View
          testID="skeleton-band"
          importantForAccessibility="no"
          accessibilityElementsHidden
          style={[styles.band, { backgroundColor: colors.mutedForeground }, bandStyle]}
        />
      ) : null}
    </View>
  );
}

export function Skeleton({
  width = '100%',
  height,
  lines,
  paused = false,
  style,
  accessibilityLabel = 'Loading',
  testID,
  ...props
}: SkeletonProps) {
  const a11y = {
    accessible: true,
    accessibilityRole: 'progressbar',
    accessibilityLabel,
    accessibilityState: { busy: !paused },
  } as const;

  if (lines === undefined) {
    return (
      <View {...props} {...a11y} testID={testID} style={[{ width, height: height ?? spacing.xl }, style]}>
        <Block paused={paused} style={styles.fill} />
      </View>
    );
  }

  const count = Math.max(1, Math.floor(lines));
  return (
    <View {...props} {...a11y} testID={testID} style={[{ width }, style]}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ gap: spacing.sm }}>
        {Array.from({ length: count }, (_, i) => (
          <Block
            key={i}
            paused={paused}
            testID="skeleton-line"
            style={{ width: i === count - 1 && count > 1 ? LAST_LINE_WIDTH : '100%', height: height ?? spacing.lg }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  block: { borderWidth: borderWidths.control, borderRadius: 0, overflow: 'hidden' },
  band: { position: 'absolute', top: 0, bottom: 0, left: 0, width: `${BAND_RATIO * 100}%`, opacity: BAND_OPACITY },
});

export default Skeleton;
