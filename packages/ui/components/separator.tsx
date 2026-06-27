import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SeparatorProps extends ViewProps {
  /**
   * The orientation of the dividing line.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
// Maintained for strict template compliance, though unused by the Separator.
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Separator({ 
  orientation = 'horizontal', 
  style, 
  ...props 
}: SeparatorProps) {
  return (
    <View
      style={cn(
        styles.base,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style
      )}
      // A separator is purely visual, so we hide it from screen readers 
      // to avoid cluttering the accessibility tree.
      accessibilityRole="none"
      importantForAccessibility="no"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.light.border,
  },
  horizontal: {
    width: '100%',
    height: borderWidths.standard,
  },
  vertical: {
    height: '100%',
    width: borderWidths.standard,
  },
});