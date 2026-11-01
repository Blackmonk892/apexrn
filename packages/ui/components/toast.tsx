import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { spacing, touchTarget, type ColorScheme } from '../lib/colors';
import { CheckIcon, CloseIcon, WarningIcon } from '../lib/icons';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface from './brutal-surface';
import Button from './button';
import Text from './text';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastProps extends ViewProps {
  /** Controls the visibility of the toast. */
  visible: boolean;
  title: string;
  description?: string;
  /**
   * Status variants add an icon and a visible text label ("Error", "Success", "Warning"),
   * so they are never colour-only.
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'destructive' | 'success' | 'warning';
  /** Auto-dismiss in milliseconds. @default 3000 */
  duration?: number;
  /** Rendered as a small Button under the text. Pressing it runs `onPress` and dismisses. */
  action?: ToastAction;
  /** Fires once the toast has left the screen, after a close tap, a swipe or the timeout. */
  onDismiss: () => void;
}

const HIDDEN_Y = -150;
const GLYPH_SIZE = 22;
const ICON_SIZE = 16;
const SWIPE_DISMISS_DISTANCE = 96;
const SWIPE_DISMISS_VELOCITY = 600;
const SWIPE_FADE_DISTANCE = 220;
const OFFSCREEN_X = 600;

const STATUS = {
  destructive: { Icon: CloseIcon, label: 'Error' },
  success: { Icon: CheckIcon, label: 'Success' },
  warning: { Icon: WarningIcon, label: 'Warning' },
} as const;

type Tone = { fill: keyof ColorScheme; ink: keyof ColorScheme };

const look = variants({
  base: { tone: { fill: 'foreground', ink: 'background' } as Tone },
  variants: {
    variant: {
      default: {},
      primary: { tone: { fill: 'primary', ink: 'primaryForeground' } },
      destructive: { tone: { fill: 'destructive', ink: 'destructiveForeground' } },
      success: { tone: { fill: 'success', ink: 'successForeground' } },
      warning: { tone: { fill: 'warning', ink: 'warningForeground' } },
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Toast({
  visible,
  title,
  description,
  variant = 'default',
  duration = 3000,
  action,
  onDismiss,
  style,
  ...props
}: ToastProps) {
  const { colors } = useTheme();
  const { reduceMotion, enter, exit } = useMotion();
  // Reduced motion drops the slide: the toast fades in place.
  const translateY = useSharedValue(reduceMotion ? 0 : HIDDEN_Y);
  const translateX = useSharedValue(0);
  const fade = useSharedValue(0);

  // Ref-stabilized so a new `onDismiss` identity doesn't restart the auto-dismiss timer.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // One dismissal per showing: a tap, a swipe and the timer must notify the parent once.
  const dismissing = useRef(false);
  const finish = useCallback(() => {
    if (dismissing.current) return;
    dismissing.current = true;
    onDismissRef.current();
  }, []);

  const hide = useCallback(() => {
    if (dismissing.current) return;
    translateY.value = withTiming(reduceMotion ? 0 : HIDDEN_Y, exit);
    fade.value = withTiming(0, exit, (done) => {
      if (done) runOnJS(finish)();
    });
  }, [translateY, fade, exit, reduceMotion, finish]);

  useEffect(() => {
    if (!visible) {
      translateY.value = withTiming(reduceMotion ? 0 : HIDDEN_Y, exit);
      fade.value = withTiming(0, exit);
      return;
    }
    dismissing.current = false;
    translateX.value = 0;
    translateY.value = withTiming(0, enter);
    fade.value = withTiming(1, enter);
    const timeout = setTimeout(hide, duration);
    return () => clearTimeout(timeout);
  }, [visible, duration, enter, exit, reduceMotion, translateX, translateY, fade, hide]);

  const pan = Gesture.Pan()
    .enabled(visible)
    // Horizontal only, so a vertical scroll under the toast is never stolen.
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const away = Math.abs(translateX.value) > SWIPE_DISMISS_DISTANCE || Math.abs(e.velocityX) > SWIPE_DISMISS_VELOCITY;
      if (away) {
        const dir = translateX.value === 0 ? Math.sign(e.velocityX) || 1 : Math.sign(translateX.value);
        translateX.value = withTiming(dir * OFFSCREEN_X, exit, (done) => {
          if (done) runOnJS(finish)();
        });
      } else {
        translateX.value = withTiming(0, enter);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value * (1 - Math.min(Math.abs(translateX.value) / SWIPE_FADE_DISTANCE, 1)),
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const { tone } = look({ variant });
  const fill = colors[tone.fill];
  const ink = colors[tone.ink];
  const status = variant in STATUS ? STATUS[variant as keyof typeof STATUS] : null;
  const destructive = variant === 'destructive';

  return (
    // Own root view: the toast is not guaranteed to sit under the app's GestureHandlerRootView.
    <GestureHandlerRootView
      style={[styles.wrapper, { left: spacing.md, right: spacing.md }, style]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      <GestureDetector gesture={pan}>
        <Animated.View
          style={animatedStyle}
          accessibilityRole={destructive ? 'alert' : undefined}
          accessibilityLiveRegion={destructive ? 'assertive' : 'polite'}
          accessibilityElementsHidden={!visible}
          importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
          {...props}
        >
          <BrutalSurface
            elevation="overlay"
            borderWidth="container"
            pressable={false}
            backgroundColor={fill}
            surfaceStyle={[styles.surface, { padding: spacing.md, gap: spacing.sm }]}
          >
            <View style={[styles.body, { gap: spacing.xs }]}>
              {status ? (
                <View style={[styles.statusRow, { gap: spacing.sm }]}>
                  <View testID={`status-icon-${variant}`} style={[styles.glyph, { backgroundColor: ink }]}>
                    <status.Icon size={ICON_SIZE} color={fill} />
                  </View>
                  <Text variant="label" tone="inherit" style={{ color: ink }}>
                    {status.label}
                  </Text>
                </View>
              ) : null}
              <Text variant="strong" tone="inherit" numberOfLines={2} style={{ color: ink }}>
                {title}
              </Text>
              {description ? (
                <Text tone="inherit" numberOfLines={3} style={{ color: ink }}>
                  {description}
                </Text>
              ) : null}
              {action ? (
                <View style={[styles.action, { marginTop: spacing.xs }]}>
                  <Button
                    title={action.label}
                    size="sm"
                    variant="outline"
                    onPress={() => {
                      action.onPress();
                      hide();
                    }}
                  />
                </View>
              ) : null}
            </View>
            <Pressable
              onPress={hide}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              hitSlop={8}
              style={[styles.close, { width: touchTarget, height: touchTarget }]}
            >
              <CloseIcon size={ICON_SIZE} color={ink} />
            </Pressable>
          </BrutalSurface>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // top is a plain default: the library has no safe-area dependency, so
  // consumers pass `style={{ top: insets.top + 8 }}` for notched devices.
  wrapper: {
    position: 'absolute',
    top: 60,
    zIndex: 9999,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  body: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyph: {
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    alignSelf: 'flex-start',
  },
  close: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.sm,
    marginRight: -spacing.sm,
  },
});

export default Toast;
