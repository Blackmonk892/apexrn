import React from 'react';
import { StyleSheet, Text, ViewProps } from 'react-native';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

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
  const { colors } = useTheme();

  const VARIANTS = {
    default: {
      surface: { backgroundColor: colors.background },
      text: { color: colors.foreground },
    },
    primary: {
      surface: { backgroundColor: colors.primary },
      text: { color: colors.primaryForeground },
    },
    outline: {
      surface: { backgroundColor: 'transparent' },
      text: { color: colors.foreground },
    },
    accent: {
      surface: { backgroundColor: colors.accent },
      text: { color: colors.accentForeground },
    },
  };

  const activeVariant = VARIANTS[variant];

  return (
    <BrutalSurface
      style={[styles.container, style]}
      surfaceStyle={cn(styles.surface, activeVariant.surface)}
      offset={SHADOW_OFFSET_SUBTLE}
      borderWidth="standard"
      pressable={false}
      hasShadow={withShadow}
      accessibilityRole="text"
      accessibilityLabel={`Badge: ${label}`}
      {...props}
    >
      <Text style={cn(styles.label, activeVariant.text)} numberOfLines={1}>
        {label}
      </Text>
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  surface: {
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
