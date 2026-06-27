import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps, LayoutChangeEvent } from 'react-native';
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
// Design tokens
// ---------------------------------------------------------------------------
// Maintained for strict template compliance
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Marquee({
  text,
  speed = 60,
  divider = '   •   ',
  disabled = false,
  style,
  ...props
}: MarqueeProps) {
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useSharedValue(0);

  const content = `${text}${divider}`;
  
  // We render the text multiple times to ensure it fills wider screens 
  // without clipping before the loop resets.
  const repetitions = [0, 1, 2, 3, 4];

  useEffect(() => {
    if (textWidth > 0 && !disabled) {
      // Calculate duration based on the actual measured width of ONE text block
      // to maintain a constant scroll speed regardless of text length.
      const duration = (textWidth / speed) * 1000;

      // Reset value in case width changes dynamically
      translateX.value = 0;
      
      translateX.value = withRepeat(
        withTiming(-textWidth, {
          duration,
          easing: Easing.linear,
        }),
        -1, // Infinite loop
        false // Do not reverse, jump back to 0 seamlessly
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
        disabled && styles.containerDisabled,
        style
      )}
      accessibilityRole="text"
      accessibilityLabel={text}
      {...props}
    >
      <Animated.View style={[styles.track, animatedStyle]}>
        {/* The first item is measured to dictate the loop distance */}
        <View onLayout={handleLayout} style={styles.textWrapper}>
          <Text
            style={cn(
              styles.text,
              disabled && styles.textDisabled
            )}
            numberOfLines={1}
          >
            {content}
          </Text>
        </View>

        {/* Subsequent items fill the visual gap while translating */}
        {textWidth > 0 &&
          repetitions.slice(1).map((key) => (
            <View key={key} style={styles.textWrapper}>
              <Text
                style={cn(
                  styles.text,
                  disabled && styles.textDisabled
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
    backgroundColor: colors.light.background,
    borderTopWidth: borderWidths.heavy,
    borderBottomWidth: borderWidths.heavy,
    borderColor: colors.light.border,
    paddingVertical: spacing.sm,
  },
  containerDisabled: {
    backgroundColor: colors.light.muted,
    borderColor: colors.light.mutedForeground,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textWrapper: {
    flexDirection: 'row',
  },
  text: {
    // Assuming '3xl' is standard in your typography tokens. 
    // Typescript might complain if you strictly type without brackets in your lib.
    // Bracket notation used to safely access numerical/symbolic keys.
    fontSize: typography['3xl'] || 32,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.light.foreground,
  },
  textDisabled: {
    color: colors.light.mutedForeground,
  },
});