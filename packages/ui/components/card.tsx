import React, { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Import spacing (which is now dynamically scaled)
import { colors, borderWidths, spacing } from '../lib/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Variant = 'default' | 'primary' | 'accent';

export interface CardProps {
  /** Card content. */
  children: ReactNode;
  /** Visual variant. @default 'default' */
  variant?: Variant;
  /** If provided, the card becomes pressable with the press animation. */
  onPress?: () => void;
  /** Container style override. */
  style?: ViewStyle;
  /** Accessibility label (for pressable cards). */
  accessibilityLabel?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  style?: ViewStyle;
}

export interface CardFooterProps {
  children: ReactNode;
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const SHADOW_OFFSET = 4;

const VARIANTS: Record<Variant, { bg: string; fg: string }> = {
  default: {
    bg: colors.light.background,
    fg: colors.light.foreground,
  },
  primary: {
    bg: colors.light.primary,
    fg: colors.light.primaryForeground,
  },
  accent: {
    bg: colors.light.accent,
    fg: colors.light.accentForeground,
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function CardHeader({ children, style }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style }: CardFooterProps) {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Card({
  children,
  variant = 'default',
  onPress,
  style,
  accessibilityLabel,
}: CardProps) {
  const pressed = useSharedValue(0);
  const v = VARIANTS[variant];
  const isPressable = !!onPress;

  // --- animation (only if pressable) ---
  const handlePressIn = () => {
    if (!isPressable) return;
    pressed.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    if (!isPressable) return;
    pressed.value = withTiming(0, { duration: 80, easing: Easing.in(Easing.quad) });
  };

  const animatedSurface = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * SHADOW_OFFSET },
      { translateY: pressed.value * SHADOW_OFFSET },
    ],
  }));

  // --- surface content ---
  const surfaceContent = (
    <View style={styles.content}>
      {children}
    </View>
  );

  // --- render ---
  return (
    <View
      style={[
        styles.root,
        { marginBottom: SHADOW_OFFSET, marginRight: SHADOW_OFFSET },
        style,
      ]}
    >
      {/* Hard shadow backing */}
      <View
        style={[
          styles.shadowBacking,
          {
            backgroundColor: colors.light.shadow,
            borderColor: colors.light.border,
            borderWidth: borderWidths.heavy,
          },
        ]}
      />

      {/* Surface */}
      {isPressable ? (
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={[
            animatedSurface,
            styles.surface,
            { backgroundColor: v.bg },
          ]}
        >
          {surfaceContent}
        </AnimatedPressable>
      ) : (
        <View style={[styles.surface, { backgroundColor: v.bg }]}>
          {surfaceContent}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    borderWidth: borderWidths.heavy,
    borderColor: colors.light.border,
    borderRadius: 0,
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
  content: {
    // This will now automatically scale because you updated spacing.lg in colors.ts
    padding: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: borderWidths.standard,
    borderBottomColor: colors.light.border,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: borderWidths.standard,
    borderTopColor: colors.light.border,
  },
});