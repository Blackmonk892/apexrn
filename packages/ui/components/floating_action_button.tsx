import React from 'react';
import { Pressable, StyleSheet, View, ViewProps, PressableProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ⚠️ IMPORTANT: Composing existing primitives
import Button from './button';

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
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FAB({
  label,
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}: FABProps) {
  const isPressed = useSharedValue(0);

  const handlePressIn = (e: any) => {
    isPressed.value = withTiming(1, { 
      duration: 100, 
      easing: Easing.out(Easing.quad) 
    });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    isPressed.value = withTiming(0, { 
      duration: 80, 
      easing: Easing.in(Easing.quad) 
    });
    onPressOut?.(e);
  };

  // Surface translates from (0,0) to (6,6) on press to sink into the elevated shadow
  const animatedSurfaceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: isPressed.value * SHADOW_OFFSET_ELEVATED },
        { translateY: isPressed.value * SHADOW_OFFSET_ELEVATED },
      ],
    };
  });

  return (
    <View style={styles.portalAnchor}>
      <View style={styles.shadowBacking} />
      
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.surface,
          animatedSurfaceStyle,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label || "Floating Action Button"}
        {...props}
      >
        {/* Composing existing visual text or elements cleanly */}
        {label ? (
          <Text style={styles.text}>{label}</Text>
        ) : (
          children
        )}
      </AnimatedPressable>
    </View>
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
    width: FAB_SIZE,
    height: FAB_SIZE,
    zIndex: 999,
    // Reserve extra margin space so the 6px elevated shadow doesn't clip
    marginBottom: SHADOW_OFFSET_ELEVATED,
    marginRight: SHADOW_OFFSET_ELEVATED,
  },
  shadowBacking: {
    position: 'absolute',
    top: SHADOW_OFFSET_ELEVATED,
    left: SHADOW_OFFSET_ELEVATED,
    right: -SHADOW_OFFSET_ELEVATED,
    bottom: -SHADOW_OFFSET_ELEVATED,
    width: FAB_SIZE,
    height: FAB_SIZE,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0, // Hard perfect square brutalism
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    width: FAB_SIZE,
    height: FAB_SIZE,
    backgroundColor: colors.light.primary,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    borderRadius: 0,
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