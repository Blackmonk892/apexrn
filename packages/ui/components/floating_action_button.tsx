import { PressableProps, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface FABProps extends Omit<PressableProps, 'style' | 'disabled'> {
  /**
   * The icon or short text label to display inside the floating action button.
   */
  label?: string;
  /**
   * Optional icon element to pass as children.
   */
  children?: React.ReactNode;
  /**
   * Disables the button.
   * @default false
   */
  disabled?: boolean;
  /**
   * Diameter of the circular icon button.
   * @default 56
   */
  size?: number;
  style?: StyleProp<ViewStyle>;
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
  disabled = false,
  size = FAB_SIZE,
  style,
  ...props
}: FABProps) {
  const { colors } = useTheme();
  const isExtended = label !== undefined && label.length > 0;

  return (
    <BrutalSurface
      style={[styles.portalAnchor, style]}
      surfaceStyle={[
        styles.surface,
        // Icon mode stays circular; label mode becomes an extended pill
        // with padding so text is never clipped by the fixed 56px box.
        isExtended
          ? { minHeight: size, paddingHorizontal: spacing.lg }
          : { width: size, height: size },
        {
          backgroundColor: disabled ? colors.muted : colors.primary,
          borderColor: disabled ? colors.mutedForeground : colors.border,
        },
      ]}
      offset={SHADOW_OFFSET_ELEVATED}
      disabled={disabled}
      hasShadow={!disabled}
      accessibilityRole="button"
      accessibilityLabel={label || 'Floating Action Button'}
      accessibilityHint="Activates the primary action"
      accessibilityState={{ disabled }}
      hitSlop={8}
      {...props}
    >
      {isExtended ? (
        <Text
          style={[styles.text, { color: disabled ? colors.mutedForeground : colors.primaryForeground }]}
          numberOfLines={1}
        >
          {label}
        </Text>
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
    elevation: 6,
  },
  surface: {
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
