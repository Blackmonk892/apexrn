import React from 'react';
import { PressableProps, StyleSheet, Text } from 'react-native';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface FABProps extends Omit<PressableProps, 'style'> {
  /**
   * The icon or short text label to display inside the floating action button.
   */
  label?: string;
  /**
   * Optional icon element to pass as children.
   */
  children?: React.ReactNode;
  style?: any;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET_ELEVATED = 6;
const FAB_SIZE = 56;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function FAB({
  label,
  children,
  style,
  ...props
}: FABProps) {
  const { colors } = useTheme();

  return (
    <BrutalSurface
      style={[styles.portalAnchor, style]}
      surfaceStyle={[styles.surface, { backgroundColor: colors.primary }]}
      offset={SHADOW_OFFSET_ELEVATED}
      accessibilityRole="button"
      accessibilityLabel={label || 'Floating Action Button'}
      {...props}
    >
      {label ? (
        <Text style={[styles.text, { color: colors.primaryForeground }]}>{label}</Text>
      ) : (
        children
      )}
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  portalAnchor: {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing['2xl'],
    zIndex: 999,
  },
  surface: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: typography.lg,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
