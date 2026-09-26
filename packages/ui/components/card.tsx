import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, borderWidths, spacing } from '../lib/colors';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Variant = 'default' | 'primary' | 'accent';

export interface CardProps {
  /** Card content. */
  children: ReactNode;
  /** Visual variant. @default 'default' */
  variant?: Variant;
  /** If provided, the card becomes pressable with the press animation. */
  onPress?: () => void;
  /** Container style override. */
  style?: ViewStyle;
  /** Accessibility label (for pressable cards). */
  accessibilityLabel?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  style?: ViewStyle;
}

export interface CardFooterProps {
  children: ReactNode;
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const SHADOW_OFFSET = 4;

const VARIANTS: Record<Variant, { bg: string; fg: string }> = {
  default: {
    bg: colors.light.background,
    fg: colors.light.foreground,
  },
  primary: {
    bg: colors.light.primary,
    fg: colors.light.primaryForeground,
  },
  accent: {
    bg: colors.light.accent,
    fg: colors.light.accentForeground,
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function CardHeader({ children, style }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style }: CardFooterProps) {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Card({
  children,
  variant = 'default',
  onPress,
  style,
  accessibilityLabel,
}: CardProps) {
  const v = VARIANTS[variant];
  const isPressable = !!onPress;

  return (
    <BrutalSurface
      style={style}
      surfaceStyle={{ backgroundColor: v.bg }}
      offset={SHADOW_OFFSET}
      pressable={isPressable}
      onPress={onPress}
      accessibilityRole={isPressable ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.content}>
        {children}
      </View>
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: borderWidths.standard,
    borderBottomColor: colors.light.border,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: borderWidths.standard,
    borderTopColor: colors.light.border,
  },
});
