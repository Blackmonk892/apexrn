import type { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
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
  style?: StyleProp<ViewStyle>;
  /** Accessibility label (for pressable cards). */
  accessibilityLabel?: string;
  /** Accessibility hint (for pressable cards). */
  accessibilityHint?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface CardFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function CardHeader({ children, style }: CardHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style }: CardFooterProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.footer, { borderTopColor: colors.border }, style]}>
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
  accessibilityHint,
}: CardProps) {
  const { colors } = useTheme();

  const VARIANTS: Record<Variant, { bg: string; fg: string }> = {
    default: {
      bg: colors.background,
      fg: colors.foreground,
    },
    primary: {
      bg: colors.primary,
      fg: colors.primaryForeground,
    },
    accent: {
      bg: colors.accent,
      fg: colors.accentForeground,
    },
  };

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
      accessibilityHint={isPressable ? accessibilityHint : undefined}
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
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: borderWidths.standard,
  },
});
