import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LabelProps extends TextProps {
  /**
   * Visually mutes the label to indicate an inactive associated form control.
   * @default false
   */
  disabled?: boolean;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Label({
  disabled = false,
  style,
  children,
  ...props
}: LabelProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={cn(
        styles.label,
        { color: disabled ? colors.mutedForeground : colors.foreground },
        style
      )}
      accessibilityRole="text"
      {...props}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    fontSize: typography.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});