import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  type GestureResponderEvent,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { controlHeight, spacing, touchTarget, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Variant = 'default' | 'primary' | 'outline' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button label text. */
  title: string;
  /** Press handler. */
  onPress?: (e: GestureResponderEvent) => void;
  /** Visual variant. @default 'default' */
  variant?: Variant;
  /** @default 'md' */
  size?: Size;
  /** Disables the button. */
  disabled?: boolean;
  /** Shows a spinner and blocks presses; the label keeps its width. */
  loading?: boolean;
  /** Optional icon element rendered beside the title. */
  icon?: ReactNode;
  /** Which side the icon sits on. @default 'left' */
  iconPosition?: 'left' | 'right';
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
  /** Accessibility label (falls back to title). */
  accessibilityLabel?: string;
  /** Accessibility hint. */
  accessibilityHint?: string;
}

const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Button({
  title,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();

  // Variants as data. Resolved per render so theme changes apply.
  const variants: Record<Variant, { bg: string; fg: string; hasShadow: boolean }> = {
    default: { bg: colors.background, fg: colors.foreground, hasShadow: true },
    primary: { bg: colors.primary, fg: colors.primaryForeground, hasShadow: true },
    outline: { bg: 'transparent', fg: colors.foreground, hasShadow: false },
    destructive: { bg: colors.destructive, fg: colors.destructiveForeground, hasShadow: true },
  };
  // Metrics are size-dependent tokens, so they are read at render time.
  const sizes: Record<Size, { px: number; fontSize: number }> = {
    sm: { px: spacing.md, fontSize: typography.sm },
    md: { px: spacing.lg, fontSize: typography.md },
    lg: { px: spacing.xl, fontSize: typography.lg },
  };

  const v = variants[variant];
  const s = sizes[size];
  const height = controlHeight[size];
  // Loading keeps the variant's colours (it is in flight, not unavailable) but
  // sinks into its shadow. Disabled goes muted + dashed so it is not colour-only.
  const showShadow = v.hasShadow && !disabled && !loading;
  const fg = disabled ? colors.mutedForeground : v.fg;

  return (
    <BrutalSurface
      style={[styles.root, style]}
      surfaceStyle={{
        backgroundColor: disabled ? colors.muted : v.bg,
        borderColor: disabled ? colors.mutedForeground : colors.border,
        borderStyle: disabled ? 'dashed' : 'solid',
        minHeight: height,
        paddingHorizontal: s.px,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      offset={SHADOW_OFFSET}
      hasShadow={showShadow}
      disabled={disabled || loading}
      onPress={onPress}
      hitSlop={Math.max(0, Math.ceil((touchTarget - height) / 2))}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      <View style={[styles.contentRow, loading && styles.hidden]}>
        {icon && iconPosition === 'left' ? (
          <View style={{ marginRight: spacing.sm }} importantForAccessibility="no-hide-descendants">
            {icon}
          </View>
        ) : null}
        <Text
          style={cn(styles.label, { fontSize: s.fontSize, color: fg })}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' ? (
          <View style={{ marginLeft: spacing.sm }} importantForAccessibility="no-hide-descendants">
            {icon}
          </View>
        ) : null}
      </View>
      {loading ? (
        <View style={styles.spinner} pointerEvents="none">
          <ActivityIndicator size="small" color={fg} />
        </View>
      ) : null}
    </BrutalSurface>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  contentRow: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Label stays laid out (width is preserved) but is invisible while loading.
  hidden: {
    opacity: 0,
  },
  spinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
