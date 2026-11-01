import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type PressableProps } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { borderWidths, spacing } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { Text } from './text';

export interface MarqueeProps extends Omit<PressableProps, 'children' | 'style'> {
  /** The message to scroll. Announced once, in full. */
  text: string;
  /** Speed in pixels per second. @default 60 */
  speed?: number;
  /** String placed after each repetition. @default "   •   " */
  divider?: string;
  /** Mutes the colours and stops the scroll. @default false */
  disabled?: boolean;
  /** Style for the outer node. */
  style?: PressableProps['style'];
}

// Enough copies to span the container plus one spare keeps the seam off-screen; the cap bounds work for tiny text.
const MAX_COPIES = 8;

export function Marquee({
  text,
  speed = 60,
  divider = '   •   ',
  disabled = false,
  style,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  ...props
}: MarqueeProps) {
  const { colors } = useTheme();
  const { reduceMotion } = useMotion();
  const [unitWidth, setUnitWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pressed, setPressed] = useState(false);
  const progress = useSharedValue(0);

  const validSpeed = Number.isFinite(speed) && speed > 0 ? speed : 0;
  const running = !disabled && !reduceMotion && validSpeed > 0 && text.length > 0 && unitWidth > 0;
  const copies =
    unitWidth > 0 && containerWidth > 0 ? Math.min(Math.ceil(containerWidth / unitWidth) + 1, MAX_COPIES) : 2;

  useEffect(() => {
    if (!running || pressed) return;
    const duration = (unitWidth / validSpeed) * 1000;
    // Resume from where a press stopped it: finish the current lap, then loop whole laps.
    const remaining = (1 - progress.value) * duration;
    progress.value = withSequence(
      withTiming(1, { duration: remaining, easing: Easing.linear }),
      withRepeat(
        withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration, easing: Easing.linear })),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
  }, [running, pressed, unitWidth, validSpeed, progress]);

  useEffect(() => {
    if (!running) progress.value = 0;
  }, [running, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * unitWidth }],
  }));

  const onContainerLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);
  const onUnitLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== unitWidth) setUnitWidth(w);
  };

  const color = disabled ? colors.mutedForeground : colors.foreground;
  const content = `${text}${divider}`;

  return (
    <Pressable
      {...props}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? text}
      onLayout={onContainerLayout}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={(state) => [
        styles.container,
        {
          backgroundColor: disabled ? colors.muted : colors.background,
          borderColor: disabled ? colors.mutedForeground : colors.border,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {reduceMotion ? (
        <Text variant="title" numberOfLines={1} style={[styles.text, { color }]}>
          {text}
        </Text>
      ) : (
        <View style={styles.clip} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Animated.View style={[styles.track, trackStyle]}>
            {Array.from({ length: copies }, (_, i) => (
              <View
                key={i}
                testID={i === 0 ? 'marquee-copy' : 'marquee-duplicate'}
                onLayout={i === 0 ? onUnitLayout : undefined}
                style={styles.unit}
              >
                <Text variant="title" numberOfLines={1} style={[styles.text, { color }]}>
                  {content}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    borderTopWidth: borderWidths.container,
    borderBottomWidth: borderWidths.container,
    paddingVertical: spacing.sm,
  },
  clip: { overflow: 'hidden' },
  track: { flexDirection: 'row', alignItems: 'center' },
  unit: { flexDirection: 'row', flexShrink: 0 },
  text: { textTransform: 'uppercase' },
});

export default Marquee;
