import type { ReactNode } from 'react';
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
export default function Badge({
  variant = 'default',
  withShadow = false,
  label,
  children,
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
  const content = children ?? label ?? '';
  const announcement = typeof content === 'string' ? content : label ?? 'badge';

  return (
    <BrutalSurface
      style={[styles.container, style]}
      surfaceStyle={cn(styles.surface, activeVariant.surface)}
      offset={SHADOW_OFFSET_SUBTLE}
      borderWidth="standard"
      pressable={false}
      hasShadow={withShadow}
      accessibilityRole="text"
      accessibilityLabel={`Badge: ${announcement}`}
      {...props}
    >
      {typeof content === 'string' ? (
        <Text style={cn(styles.label, activeVariant.text)} numberOfLines={1} ellipsizeMode="tail">
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
