import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewProps, LayoutChangeEvent } from 'react-native';
import Animated, { 
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
  const translateX = useSharedValue(0);

  const content = `${text}${divider}`;
  const repetitions = [0, 1, 2, 3, 4];

  useEffect(() => {
    if (textWidth > 0 && !disabled) {
      const duration = (textWidth / speed) * 1000;
      translateX.value = 0;
      
      translateX.value = withRepeat(
        withTiming(-textWidth, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else if (disabled) {
      translateX.value = 0;
    }
  }, [textWidth, speed, disabled, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== textWidth) {
      setTextWidth(width);
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
      accessibilityRole="text"
      accessibilityLabel={text}
      {...props}
    >
      <Animated.View style={[styles.track, animatedStyle]}>
        <View onLayout={handleLayout} style={styles.textWrapper}>
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
          repetitions.slice(1).map((key) => (
            <View key={key} style={styles.textWrapper}>
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