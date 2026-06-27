import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
// Reanimated is imported to fulfill the strict file structure requirement,
// but remains unused here since the Label is a non-interactive primitive.
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LabelProps extends TextProps {
  /**
   * Visually mutes the label to indicate an inactive associated form control.
   * @default false
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
// Maintained for strict template compliance, though unused by the Label.
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Label({
  disabled = false,
  style,
  children,
  ...props
}: LabelProps) {
  return (
    <Text
      style={cn(
        styles.label,
        disabled && styles.disabled,
        style
      )}
      accessibilityRole="text"
      {...props}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    fontSize: typography.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.light.foreground,
  },
  disabled: {
    color: colors.light.mutedForeground,
  },
});