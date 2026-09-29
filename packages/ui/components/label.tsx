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
export function Label({
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
        // Size-dependent tokens are read at render time, not frozen at import.
        { marginBottom: spacing.xs, fontSize: typography.sm },
        { color: disabled ? colors.mutedForeground : colors.foreground },
        style
      )}
      accessibilityRole="text"
      maxFontSizeMultiplier={1.3}
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
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

export default Label;
