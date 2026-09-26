import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

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
   * Optional icon to display on the left side.
   */
  icon?: React.ReactNode;
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

  return (
    <View
      style={cn(styles.container, style)}
      accessibilityRole="alert"
      {...props}
    >
      <View style={[styles.shadow, { backgroundColor: colors.shadow, borderColor: colors.border }]} />
      
      <View 
        style={[
          styles.surface, 
          { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            borderLeftColor: activeColor 
          }
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {title}
          </Text>
          {description ? (
            <Text style={[styles.description, { color: colors.foreground }]}>
              {description}
            </Text>
          ) : null}
        </View>
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
    width: '100%',
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
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