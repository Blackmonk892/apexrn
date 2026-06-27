import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors, borderWidths } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Variant = 'default' | 'primary' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button label text. */
  title: string;
  /** Press handler. */
  onPress?: () => void;
  /** Visual variant. @default 'default' */
  variant?: Variant;
  /** Size preset. @default 'md' */
  size?: Size;
  /** Disables the button. */
  disabled?: boolean;
  /** Shows a loading spinner. */
  loading?: boolean;
  /** Optional icon element rendered beside the title. */
  icon?: ReactNode;
  /** Which side the icon sits on. @default 'left' */
  iconPosition?: 'left' | 'right';
  /** Container style override. */
  style?: ViewStyle;
  /** Accessibility label (falls back to title). */
  accessibilityLabel?: string;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const SHADOW_OFFSET = 4;

const VARIANTS: Record<Variant, { bg: string; fg: string; hasShadow: boolean }> = {
  default: {
    bg: colors.light.background,
    fg: colors.light.foreground,
    hasShadow: true,
  },
  primary: {
    bg: colors.light.primary,
    fg: colors.light.primaryForeground,
    hasShadow: true,
  },
  outline: {
    bg: 'transparent',
    fg: colors.light.foreground,
    hasShadow: false,
  },
};

const SIZES: Record<Size, { py: number; px: number; fontSize: number }> = {
  sm: { py: 8, px: 14, fontSize: 13 },
  md: { py: 12, px: 20, fontSize: 15 },
  lg: { py: 16, px: 28, fontSize: 17 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
}: ButtonProps) {
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const showShadow = v.hasShadow && !isDisabled;

  // --- animation ---
  const handlePressIn = () => {
    if (isDisabled || !showShadow) return;
    pressed.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    if (isDisabled || !showShadow) return;
    pressed.value = withTiming(0, { duration: 80, easing: Easing.in(Easing.quad) });
  };

  const animatedSurface = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * SHADOW_OFFSET },
      { translateY: pressed.value * SHADOW_OFFSET },
    ],
  }));

  // --- colors ---
  const surfaceBg = isDisabled ? colors.light.muted : v.bg;
  const textColor = isDisabled ? colors.light.mutedForeground : v.fg;
  const borderColor = isDisabled ? colors.light.mutedForeground : colors.light.border;

  // --- content ---
  const content = loading ? (
    <ActivityIndicator size="small" color={textColor} />
  ) : (
    <View style={styles.contentRow}>
      {icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      <Text
        style={cn(styles.label, { fontSize: s.fontSize, color: textColor })}
        numberOfLines={1}
      >
        {title}
      </Text>
      {icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.root,
        showShadow && { marginBottom: SHADOW_OFFSET, marginRight: SHADOW_OFFSET },
        style,
      ]}
    >
      {/* Hard shadow backing */}
      {showShadow && (
        <View
          style={[
            styles.shadowBacking,
            {
              backgroundColor: colors.light.shadow,
              borderColor,
              borderWidth: borderWidths.heavy,
            },
          ]}
        />
      )}

      {/* Pressable surface */}
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled }}
        style={[
          showShadow ? animatedSurface : undefined,
          styles.surface,
          {
            backgroundColor: surfaceBg,
            borderColor,
            paddingVertical: s.py,
            paddingHorizontal: s.px,
          },
        ]}
      >
        {content}
      </AnimatedPressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    borderWidth: borderWidths.heavy,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowBacking: {
    ...StyleSheet.absoluteFillObject,
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    zIndex: 1,
    borderRadius: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});