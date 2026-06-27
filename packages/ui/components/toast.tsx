import React, { useEffect, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ToastProps extends ViewProps {
  /**
   * Controls the visibility of the toast.
   */
  visible: boolean;
  /**
   * The main heading text for the toast.
   */
  title: string;
  /**
   * Optional secondary descriptive text.
   */
  description?: string;
  /**
   * The visual severity of the toast.
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'destructive';
  /**
   * Auto-dismiss duration in milliseconds.
   * @default 3000
   */
  duration?: number;
  /**
   * Callback fired when the toast is dismissed (either manually or via timeout).
   */
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;

const VARIANTS = {
  default: {
    // Inverted high-contrast by default
    surface: { backgroundColor: colors.light.foreground },
    text: { color: colors.light.background },
  },
  primary: {
    surface: { backgroundColor: colors.light.primary },
    text: { color: colors.light.primaryForeground },
  },
  destructive: {
    // Fallback to strict hex if destructive isn't in your theme object yet
    surface: { backgroundColor: colors.light.destructive || '#EF4444' },
    text: { color: colors.light.destructiveForeground || '#FFFFFF' },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Toast({
  visible,
  title,
  description,
  variant = 'default',
  duration = 3000,
  onDismiss,
  style,
  ...props
}: ToastProps) {
  // Start off-screen (-150px)
  const translateY = useSharedValue(-150);
  const activeVariant = VARIANTS[variant];

  const hideToast = useCallback(() => {
    translateY.value = withTiming(
      -150, 
      { duration: 250, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      }
    );
  }, [translateY, onDismiss]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (visible) {
      // Slide in
      translateY.value = withTiming(0, { 
        duration: 300, 
        easing: Easing.out(Easing.back(1.5)) // Slight brutalist snap
      });

      // Set auto-dismiss timer
      timeout = setTimeout(() => {
        hideToast();
      }, duration);
    } else {
      // If forced hidden externally, slide out
      translateY.value = withTiming(-150, { 
        duration: 250, 
        easing: Easing.in(Easing.quad) 
      });
    }

    return () => clearTimeout(timeout);
  }, [visible, duration, translateY, hideToast]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // If it's not visible and fully translated away, we still render it 
  // but it's hidden out of the viewport. React Native handles this efficiently.
  return (
    <Animated.View 
      style={[styles.absoluteWrapper, animatedStyle, style]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      {...props}
    >
      <Pressable onPress={hideToast} style={styles.container}>
        <View style={styles.shadow} />
        
        <View style={cn(styles.surface, activeVariant.surface)}>
          <View style={styles.contentContainer}>
            <Text style={cn(styles.title, activeVariant.text)} numberOfLines={2}>
              {title}
            </Text>
            {description ? (
              <Text style={cn(styles.description, activeVariant.text)}>
                {description}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  absoluteWrapper: {
    position: 'absolute',
    top: 60, // Standard top inset offset. Adjust based on your Safe Area strategy.
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999, // Toasts must sit above everything
  },
  container: {
    position: 'relative',
    width: '100%',
    // Reserve space so the 4px shadow doesn't clip
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    borderRadius: 0,
    padding: spacing.md,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    fontSize: typography.sm,
    fontWeight: '500',
  },
});