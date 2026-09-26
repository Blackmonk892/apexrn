import React from 'react';
import { PressableProps, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../lib/colors';
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
   * Optional icon element to pass as children (composed inside).
   */
  children?: React.ReactNode;
  /**
   * Optional style overrides.
   */
  style?: any;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET_ELEVATED = 6; // Elevated offset to appear very high above content
const FAB_SIZE = 56; // Perfect square dimension

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function FAB({
  label,
  children,
  style,
  ...props
}: FABProps) {
  return (
    <BrutalSurface
      style={[styles.portalAnchor, style]}
      surfaceStyle={styles.surface}
      offset={SHADOW_OFFSET_ELEVATED}
      accessibilityRole="button"
      accessibilityLabel={label || 'Floating Action Button'}
      {...props}
    >
      {label ? (
        <Text style={styles.text}>{label}</Text>
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
    // Pull from spacing tokens as constrained
    bottom: spacing['2xl'],
    right: spacing['2xl'],
    zIndex: 999,
  },
  surface: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: typography.lg,
    fontWeight: '800',
    color: colors.light.primaryForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
