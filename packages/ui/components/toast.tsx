import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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
  const { colors } = useTheme();
  const translateY = useSharedValue(-150);

  const variants = {
    default: {
      surface: { backgroundColor: colors.foreground },
      text: { color: colors.background },
    },
    primary: {
      surface: { backgroundColor: colors.primary },
      text: { color: colors.primaryForeground },
    },
    destructive: {
      surface: { backgroundColor: colors.destructive },
      text: { color: colors.destructiveForeground },
    },
  };

  const activeVariant = variants[variant];

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
    let timeout: ReturnType<typeof setTimeout>;

    if (visible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.back(1.5))
      });

      timeout = setTimeout(() => {
        hideToast();
      }, duration);
    } else {
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

  return (
    <Animated.View
      style={[styles.absoluteWrapper, animatedStyle, style]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      {...props}
    >
      <BrutalSurface
        offset={SHADOW_OFFSET}
        borderWidth="heavy"
        onPress={hideToast}
        surfaceStyle={cn(styles.surface, activeVariant.surface)}
      >
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
      </BrutalSurface>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  absoluteWrapper: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
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
