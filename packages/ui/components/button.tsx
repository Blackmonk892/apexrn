import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Variant = 'default' | 'primary' | 'outline' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button label text. */
  title: string;
  /** Press handler. */
  onPress?: () => void;
  /** Visual variant. @default 'default' */
  variant?: Variant;
  /** Size preset. @default 'md' */
  size?: Size;
  /** Disables the button. */
  disabled?: boolean;
  /** Shows a loading spinner. */
  loading?: boolean;
  /** Optional icon element rendered beside the title. */
  icon?: ReactNode;
  /** Which side the icon sits on. @default 'left' */
  iconPosition?: 'left' | 'right';
  /** Container style override. */
  style?: ViewStyle;
  /** Accessibility label (falls back to title). */
  accessibilityLabel?: string;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const SHADOW_OFFSET = 4;

const VARIANTS: Record<Variant, { bg: string; fg: string; hasShadow: boolean }> = {
  default: {
    bg: colors.light.background,
    fg: colors.light.foreground,
    hasShadow: true,
  },
  primary: {
    bg: colors.light.primary,
    fg: colors.light.primaryForeground,
    hasShadow: true,
  },
  outline: {
    bg: 'transparent',
    fg: colors.light.foreground,
    hasShadow: false,
  },
  destructive: {
    bg: colors.light.destructive,
    fg: colors.light.destructiveForeground,
    hasShadow: true,
  },
};

const SIZES: Record<Size, { py: number; px: number; fontSize: number }> = {
  sm: { py: spacing.sm, px: spacing.md, fontSize: typography.sm },
  md: { py: spacing.md, px: spacing.lg, fontSize: typography.md },
  lg: { py: spacing.lg, px: spacing.xl, fontSize: typography.lg },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Button({
  title,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const showShadow = v.hasShadow && !isDisabled;

  const surfaceBg = isDisabled ? colors.light.muted : v.bg;
  const textColor = isDisabled ? colors.light.mutedForeground : v.fg;
  const borderColor = isDisabled ? colors.light.mutedForeground : colors.light.border;

  const content = loading ? (
    <ActivityIndicator size="small" color={textColor} />
  ) : (
    <View style={styles.contentRow}>
      {icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      <Text
        style={cn(styles.label, { fontSize: s.fontSize, color: textColor })}
        numberOfLines={1}
      >
        {title}
      </Text>
      {icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );

  return (
    <BrutalSurface
      style={[styles.root, style]}
      surfaceStyle={{
        backgroundColor: surfaceBg,
        borderColor,
        paddingVertical: s.py,
        paddingHorizontal: s.px,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      offset={SHADOW_OFFSET}
      hasShadow={showShadow}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {content}
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
