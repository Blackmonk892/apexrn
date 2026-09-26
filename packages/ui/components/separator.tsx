import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { borderWidths } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SeparatorProps extends ViewProps {
  /**
   * The orientation of the dividing line.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  style?: any;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Separator({ 
  orientation = 'horizontal', 
  style, 
  ...props 
}: SeparatorProps) {
  const { colors } = useTheme();

  return (
    <View
      style={cn(
        styles.base,
        { backgroundColor: colors.border },
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style
      )}
      accessibilityRole="none"
      importantForAccessibility="no"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  base: {},
  horizontal: {
    width: '100%',
    height: borderWidths.standard,
  },
  vertical: {
    height: '100%',
    width: borderWidths.standard,
  },
});