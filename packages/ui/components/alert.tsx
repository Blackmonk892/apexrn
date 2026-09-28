import type { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AlertProps extends ViewProps {
  /**
   * The visual severity of the alert.
   * @default 'default'
   */
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  /**
   * The main heading text for the alert.
   */
  title: string;
  /**
   * Optional secondary descriptive text.
   */
  description?: string;
  /**
   * Optional icon to display on the left side. Decorative — hidden from
   * screen readers (the title/description carry the announcement).
   */
  icon?: ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
const LEFT_BORDER_WIDTH = 8;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Alert({
  variant = 'default',
  title,
  description,
  icon,
  style,
  ...props
}: AlertProps) {
  const { colors } = useTheme();

  const variantColors = {
    default: colors.foreground,
    destructive: colors.destructive,
    warning: colors.warning,
    success: colors.success,
  };

  const activeColor = variantColors[variant];
  const announcement = description ? `${title}. ${description}` : title;

  return (
    <BrutalSurface
      style={cn(styles.container, style)}
      surfaceStyle={[
        styles.surface,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderLeftColor: activeColor,
        },
      ]}
      offset={SHADOW_OFFSET}
      borderWidth="heavy"
      pressable={false}
      accessibilityRole="alert"
      accessibilityLabel={announcement}
      {...props}
    >
      {icon && (
        <View style={styles.iconContainer} accessible={false} importantForAccessibility="no-hide-descendants">
          {icon}
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {description}
          </Text>
        ) : null}
      </View>
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: borderWidths.heavy,
    borderLeftWidth: LEFT_BORDER_WIDTH,
    borderRadius: 0,
    padding: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.sm,
    marginTop: 2, 
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    fontSize: typography.sm,
  },
});