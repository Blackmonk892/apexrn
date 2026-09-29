import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

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
   * The visual style of the toast. Status variants add a glyph and a spoken
   * prefix ("Error.", "Success.", "Warning."), so they are never colour-only.
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'destructive' | 'success' | 'warning';
  /**
   * Auto-dismiss duration in milliseconds.
   * @default 3000
   */
  duration?: number;
  /**
   * Callback fired once the toast has slid out after being dismissed
   * (manually or via timeout).
   */
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
const HIDDEN_Y = -150;
const GLYPH_SIZE = 22;

const STATUS = {
  destructive: { glyph: '✕', spoken: 'Error. ' },
  success: { glyph: '✓', spoken: 'Success. ' },
  warning: { glyph: '!', spoken: 'Warning. ' },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Toast({
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
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(HIDDEN_Y);

  // Ref-stabilized so a re-created `onDismiss` identity doesn't restart
  // the auto-dismiss timer on every parent render.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // One dismissal per showing: a tap followed by the auto-dismiss timer (or
  // two quick taps) must notify the parent once.
  const dismissing = useRef(false);

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
    success: {
      surface: { backgroundColor: colors.success },
      text: { color: colors.successForeground },
    },
    warning: {
      surface: { backgroundColor: colors.warning },
      text: { color: colors.warningForeground },
    },
  };
  const activeVariant = variants[variant];
  const status = variant in STATUS ? STATUS[variant as keyof typeof STATUS] : null;

  const notifyDismissed = useCallback(() => {
    onDismissRef.current();
  }, []);

  const hideToast = useCallback(() => {
    if (dismissing.current) return;
    dismissing.current = true;
    // Notify from the animation's completion callback (on the JS thread),
    // and only if the slide-out actually finished.
    translateY.value = withTiming(
      HIDDEN_Y,
      { duration: reduceMotion ? 0 : 250, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) runOnJS(notifyDismissed)();
      },
    );
  }, [translateY, reduceMotion, notifyDismissed]);

  useEffect(() => {
    if (!visible) {
      translateY.value = withTiming(HIDDEN_Y, {
        duration: reduceMotion ? 0 : 250,
        easing: Easing.in(Easing.quad),
      });
      return;
    }

    dismissing.current = false;
    translateY.value = withTiming(0, {
      duration: reduceMotion ? 0 : 300,
      easing: reduceMotion ? Easing.linear : Easing.out(Easing.back(1.5)),
    });

    const timeout = setTimeout(hideToast, duration);
    return () => clearTimeout(timeout);
  }, [visible, duration, reduceMotion, translateY, hideToast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const label = `${status?.spoken ?? ''}${title}${description ? `. ${description}` : ''}`;

  return (
    <Animated.View
      style={[styles.absoluteWrapper, { left: spacing.md, right: spacing.md }, style, animatedStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      {...props}
    >
      <BrutalSurface
        offset={SHADOW_OFFSET}
        borderWidth="heavy"
        onPress={hideToast}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Double tap to dismiss this notification"
        surfaceStyle={cn(styles.surface, { padding: spacing.md }, activeVariant.surface)}
      >
        {status ? (
          <View
            style={[styles.glyph, { backgroundColor: activeVariant.text.color, marginRight: spacing.sm }]}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            <Text style={[styles.glyphText, { color: activeVariant.surface.backgroundColor }]}>{status.glyph}</Text>
          </View>
        ) : null}
        <View style={[styles.contentContainer, { gap: spacing.xs }]}>
          <Text
            style={cn(styles.title, { fontSize: typography.sm }, activeVariant.text)}
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
          {description ? (
            <Text
              style={cn(styles.description, { fontSize: typography.sm }, activeVariant.text)}
              numberOfLines={3}
              maxFontSizeMultiplier={1.3}
            >
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
  // top is a plain default: the library has no safe-area dependency, so
  // consumers pass `style={{ top: insets.top + 8 }}` for notched devices.
  absoluteWrapper: {
    position: 'absolute',
    top: 60,
    zIndex: 9999,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyph: {
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    fontWeight: '500',
  },
});

export default Toast;
