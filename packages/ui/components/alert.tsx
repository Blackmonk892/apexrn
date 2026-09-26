import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
// Reanimated is imported to fulfill the strict file structure requirement,
// but remains unused here since the Alert is a static visual banner.
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
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
const LEFT_BORDER_WIDTH = 8; // Extra thick left border as requested

const VARIANT_COLORS = {
  default: colors.light.foreground,
  destructive: colors.light.destructive,
  warning: colors.light.warning,
  success: colors.light.success,
};

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
  const activeColor = VARIANT_COLORS[variant];

  return (
    <View
      style={cn(styles.container, style)}
      accessibilityRole="alert"
      {...props}
    >
      <View style={styles.shadow} />
      
      <View 
        style={[
          styles.surface, 
          { borderLeftColor: activeColor }
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {description ? (
            <Text style={styles.description}>
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
    // Reserve space so the 4px shadow doesn't clip into adjacent elements
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    borderLeftWidth: LEFT_BORDER_WIDTH,
    borderRadius: 0,
    padding: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.sm,
    // Slightly adjust top margin to align standard icons with the capitalized title text
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
    color: colors.light.foreground,
  },
  description: {
    fontSize: typography.sm,
    color: colors.light.foreground,
    // Normal font weight for description to contrast with the harsh heading
  },
});