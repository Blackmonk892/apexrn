import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
// Reanimated is imported to fulfill the strict file structure requirement,
// but remains unused here since the Badge is a non-interactive visual indicator.
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface BadgeProps extends ViewProps {
  /**
   * The visual style of the badge.
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'outline' | 'accent';
  /**
   * Toggles the subtle 2px hard shadow.
   * @default false
   */
  withShadow?: boolean;
  /**
   * The text to display inside the badge.
   */
  label: string;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET_SUBTLE = 2;

const VARIANTS = {
  default: {
    surface: { backgroundColor: colors.light.background },
    text: { color: colors.light.foreground },
  },
  primary: {
    surface: { backgroundColor: colors.light.primary },
    text: { color: colors.light.primaryForeground },
  },
  outline: {
    surface: { backgroundColor: 'transparent' },
    text: { color: colors.light.foreground },
  },
  accent: {
    // Assuming 'accent' is mapped to yellow in your colors object. 
    // Fallbacks included just in case to guarantee the strict brutalist look.
    surface: { backgroundColor: colors.light.accent || '#FACC15' },
    text: { color: colors.light.accentForeground || '#000000' },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Badge({
  variant = 'default',
  withShadow = false,
  label,
  style,
  ...props
}: BadgeProps) {
  const activeVariant = VARIANTS[variant];

  return (
    <View
      style={cn(
        styles.container,
        withShadow && styles.containerWithShadow,
        style
      )}
      accessibilityRole="text"
      accessibilityLabel={`Badge: ${label}`}
      {...props}
    >
      {withShadow && <View style={styles.shadow} />}
      <View style={cn(styles.surface, activeVariant.surface)}>
        <Text
          style={cn(styles.label, activeVariant.text)}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  containerWithShadow: {
    marginBottom: SHADOW_OFFSET_SUBTLE,
    marginRight: SHADOW_OFFSET_SUBTLE,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET_SUBTLE,
    left: SHADOW_OFFSET_SUBTLE,
    right: -SHADOW_OFFSET_SUBTLE,
    bottom: -SHADOW_OFFSET_SUBTLE,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    borderWidth: borderWidths.standard,
    borderColor: colors.light.border,
    borderRadius: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});