import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewProps, LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface MarqueeProps extends ViewProps {
  /**
   * The text to scroll infinitely.
   */
  text: string;
  /**
   * Speed in pixels per second.
   * @default 60
   */
  speed?: number;
  /**
   * Divider string to place between repetitions.
   * @default "   •   "
   */
  divider?: string;
  /**
   * Visually mutes the marquee text and borders.
   * @default false
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Marquee({
  text,
  speed = 60,
  divider = '   •   ',
  disabled = false,
  style,
  ...props
}: MarqueeProps) {
  const { colors } = useTheme();
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  const content = `${text}${divider}`;
  // Enough copies to cover the container with no gap, clamped to avoid
  // over-rendering very long strings on small screens.
  const repetitions =
    textWidth > 0 && containerWidth > 0
      ? Math.max(2, Math.min(Math.ceil(containerWidth / textWidth) + 1, 8))
      : 5;

  const validSpeed = Number.isFinite(speed) && speed > 0 ? speed : 0;

  useEffect(() => {
    cancelAnimation(translateX);
    if (textWidth > 0 && !disabled && validSpeed > 0 && text.length > 0) {
      const duration = (textWidth / validSpeed) * 1000;
      translateX.value = 0;

      translateX.value = withRepeat(
        withTiming(-textWidth, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      translateX.value = 0;
    }
  }, [textWidth, containerWidth, validSpeed, disabled, content, text, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleTextLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== textWidth) {
      setTextWidth(width);
    }
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  return (
    <View
      style={cn(
        styles.container,
        { backgroundColor: colors.background, borderColor: colors.border },
        disabled && { backgroundColor: colors.muted, borderColor: colors.mutedForeground },
        style
      )}
      onLayout={handleContainerLayout}
      accessibilityRole="text"
      accessibilityLabel={text}
      {...props}
    >
      {/* The repeated track is decorative: the outer label carries the
          announcement so screen readers don't read the text 5×. */}
      <Animated.View
        style={[styles.track, animatedStyle]}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <View onLayout={handleTextLayout} style={styles.textWrapper}>
          <Text
            style={cn(
              styles.text,
              { color: colors.foreground },
              disabled && { color: colors.mutedForeground }
            )}
            numberOfLines={1}
          >
            {content}
          </Text>
        </View>

        {textWidth > 0 &&
          Array.from({ length: repetitions - 1 }, (_, i) => (
            <View key={i} style={styles.textWrapper}>
              <Text
                style={cn(
                  styles.text,
                  { color: colors.foreground },
                  disabled && { color: colors.mutedForeground }
                )}
                numberOfLines={1}
              >
                {content}
              </Text>
            </View>
          ))}
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderTopWidth: borderWidths.heavy,
    borderBottomWidth: borderWidths.heavy,
    paddingVertical: spacing.sm,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textWrapper: {
    flexDirection: 'row',
  },
  text: {
    fontSize: typography['3xl'] || 32,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});