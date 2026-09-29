import type { ReactNode } from 'react';
import { StyleSheet, Text, ViewProps } from 'react-native';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface BadgeProps extends ViewProps {
  /**
   * The visual style of the badge.
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'outline' | 'accent' | 'destructive' | 'success' | 'warning';
  /**
   * Toggles the subtle 2px hard shadow.
   * @default false
   */
  withShadow?: boolean;
  /**
   * The text to display inside the badge. `children` takes precedence when
   * both are provided.
   */
  label?: string;
  /**
   * Custom badge content. Falls back to `label` when omitted.
   */
  children?: ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET_SUBTLE = 2;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Badge({
  variant = 'default',
  withShadow = false,
  label,
  children,
  style,
  ...props
}: BadgeProps) {
  const { colors } = useTheme();

  const VARIANTS = {
    // Inverse "ink" fill so default reads as a different variant from outline.
    default: {
      surface: { backgroundColor: colors.foreground },
      text: { color: colors.background },
    },
    primary: {
      surface: { backgroundColor: colors.primary },
      text: { color: colors.primaryForeground },
    },
    outline: {
      // Transparent would let the hard shadow show through the fill.
      surface: { backgroundColor: withShadow ? colors.background : 'transparent' },
      text: { color: colors.foreground },
    },
    accent: {
      surface: { backgroundColor: colors.accent },
      text: { color: colors.accentForeground },
    },
    // Status fills. The label text carries the meaning, so colour is never the only signal.
    destructive: {
      surface: { backgroundColor: colors.destructive },
      text: { color: colors.destructiveForeground },
    },
    success: {
      surface: { backgroundColor: colors.success },
      text: { color: colors.successForeground },
    },
    warning: {
      surface: { backgroundColor: colors.warning },
      text: { color: colors.warningForeground },
    },
  };

  const activeVariant = VARIANTS[variant];
  const content = children ?? label ?? '';

  return (
    <BrutalSurface
      style={[styles.container, style]}
      surfaceStyle={cn(
        styles.surface,
        { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
        activeVariant.surface,
      )}
      offset={SHADOW_OFFSET_SUBTLE}
      borderWidth="standard"
      pressable={false}
      hasShadow={withShadow}
      accessible={typeof content === 'string'}
      accessibilityRole="text"
      {...props}
    >
      {typeof content === 'string' ? (
        <Text
          style={cn(styles.label, { fontSize: typography.xs }, activeVariant.text)}
          numberOfLines={1}
          ellipsizeMode="tail"
          maxFontSizeMultiplier={1.3}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    // Without a cap, a nowrap label's min-content width defeats truncation.
    maxWidth: '100%',
  },
  // Row + shrinkable label (same as Button) so long text truncates instead of overflowing.
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

export default Badge;
