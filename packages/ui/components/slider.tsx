import { useEffect, useState } from 'react';
import {
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { borderWidths, spacing, touchTarget } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import { Text } from './text';

export interface SliderProps extends Omit<ViewProps, 'style'> {
  /** Controlled value. Omit for an uncontrolled slider. */
  value?: number;
  /** Initial value when uncontrolled. @default min */
  defaultValue?: number;
  /** Fires whenever the stepped value changes, including while dragging. */
  onValueChange?: (value: number) => void;
  /** Fires once with the final value when a drag, tap or accessibility action ends. */
  onSlidingComplete?: (value: number) => void;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** @default 1 */
  step?: number;
  disabled?: boolean;
  /** Shows the current value in mono above the track. @default false */
  showValue?: boolean;
  /** Formats the value label. Defaults to the plain number. */
  formatValue?: (value: number) => string;
  /** Style for the outer wrapper. */
  style?: StyleProp<ViewStyle>;
}

const THUMB_SIZE = 20;
const TRACK_HEIGHT = borderWidths.control;

export function Slider({
  value: valueProp,
  defaultValue,
  onValueChange,
  onSlidingComplete,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  formatValue,
  style,
  testID,
  ...props
}: SliderProps) {
  const { colors, elevation } = useTheme();
  const { reduceMotion, selection } = useMotion();
  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const value = valueProp ?? internalValue;

  // Degenerate configs (max <= min, non-finite, step <= 0) collapse to a no-op rather than NaN.
  const range = max - min;
  const validRange = Number.isFinite(range) && range > 0 ? range : 0;
  const validStep = Number.isFinite(step) && step > 0 ? step : 0;

  // The thumb's hard shadow extends past its box; reserve it so the thumb stays inside the track.
  const shadow = elevation.control;
  const width = useSharedValue(0);
  const ratio = useSharedValue(0);
  const startRatio = useSharedValue(0);
  const dragging = useSharedValue(false);
  const lastEmitted = useSharedValue(Number.NaN);

  // Runs on the UI thread; it only touches its numeric arguments and captured primitives.
  const snap = (r: number) => {
    'worklet';
    if (validRange <= 0) return min;
    const raw = min + Math.max(0, Math.min(r, 1)) * validRange;
    const stepped = validStep > 0 ? Math.round(raw / validStep) * validStep : raw;
    return Math.max(min, Math.min(stepped, max));
  };

  const toRatio = (v: number) =>
    validRange > 0 ? (Math.max(min, Math.min(v, max)) - min) / validRange : 0;

  const current = snap(toRatio(value));

  useEffect(() => {
    // A controlled parent echoing values mid-drag must not fight the finger.
    if (dragging.value) return;
    const to = toRatio(value);
    ratio.value = reduceMotion ? to : withTiming(to, selection);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toRatio is derived from min/max/value
  }, [value, min, max, reduceMotion, selection, ratio, dragging]);

  const commit = (next: number) => {
    if (valueProp === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const complete = (next: number) => onSlidingComplete?.(next);

  const interactive = !disabled && validRange > 0;

  const pan = Gesture.Pan()
    .enabled(interactive)
    // Horizontal only: vertical drags belong to a parent ScrollView.
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      dragging.value = true;
      startRatio.value = ratio.value;
      lastEmitted.value = Number.NaN;
    })
    .onUpdate((event) => {
      const travel = width.value - THUMB_SIZE - shadow;
      if (travel <= 0) return;
      const next = Math.max(0, Math.min(startRatio.value + event.translationX / travel, 1));
      ratio.value = next;
      const live = snap(next);
      if (live !== lastEmitted.value) {
        lastEmitted.value = live;
        runOnJS(commit)(live);
      }
    })
    .onEnd(() => {
      dragging.value = false;
      const final = snap(ratio.value);
      ratio.value = withTiming((final - min) / validRange, { duration: reduceMotion ? 0 : 100 });
      if (final !== lastEmitted.value) runOnJS(commit)(final);
      runOnJS(complete)(final);
    });

  const tap = Gesture.Tap()
    .enabled(interactive)
    .onEnd((event) => {
      const travel = width.value - THUMB_SIZE - shadow;
      if (travel <= 0) return;
      // Centre the thumb on the tap point.
      const final = snap((event.x - THUMB_SIZE / 2) / travel);
      ratio.value = withTiming((final - min) / validRange, reduceMotion ? { duration: 0 } : selection);
      runOnJS(commit)(final);
      runOnJS(complete)(final);
    });

  const gesture = Gesture.Race(pan, tap);

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (!interactive) return;
    const delta = validStep > 0 ? validStep : validRange / 20;
    const dir = event.nativeEvent.actionName === 'increment' ? 1 : -1;
    const next = snap(toRatio(current + dir * delta));
    commit(next);
    complete(next);
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ratio.value * Math.max(0, width.value - THUMB_SIZE - shadow) }],
  }));

  // The fill is a full-width rule scaled from the left edge to the thumb's centre; width never animates.
  const fillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX:
          width.value > 0
            ? (ratio.value * Math.max(0, width.value - THUMB_SIZE - shadow) + THUMB_SIZE / 2) / width.value
            : 0,
      },
    ],
    transformOrigin: 'left center',
  }));

  const label = formatValue ? formatValue(current) : String(current);

  return (
    <View style={[styles.wrap, { gap: spacing.xs }, style]}>
      {showValue ? (
        <Text
          variant="mono"
          tone={disabled ? 'muted' : 'default'}
          testID={testID ? `${testID}-value` : undefined}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {label}
        </Text>
      ) : null}
      <GestureDetector gesture={gesture}>
        <View
          testID={testID}
          style={styles.hit}
          onLayout={(e: LayoutChangeEvent) => {
            width.value = e.nativeEvent.layout.width;
          }}
          accessible
          accessibilityRole="adjustable"
          accessibilityValue={{ min, max, now: current, text: label }}
          accessibilityState={{ disabled }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={onAccessibilityAction}
          {...props}
        >
          <View style={[styles.rule, { backgroundColor: disabled ? colors.mutedForeground : colors.border }]} />
          {disabled ? null : (
            <Animated.View
              testID={testID ? `${testID}-fill` : undefined}
              style={[styles.rule, { backgroundColor: colors.primary }, fillStyle]}
            />
          )}
          <Animated.View
            testID={testID ? `${testID}-thumb` : undefined}
            style={[styles.thumbWrap, thumbStyle]}
            pointerEvents="none"
          >
            <BrutalSurface
              pressable={false}
              disabled={disabled}
              elevation="control"
              borderWidth="control"
              backgroundColor={disabled ? colors.muted : colors.background}
              borderColor={disabled ? colors.mutedForeground : colors.border}
              surfaceStyle={styles.thumb}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  hit: { height: touchTarget, justifyContent: 'center' },
  rule: { position: 'absolute', left: 0, right: 0, height: TRACK_HEIGHT },
  thumbWrap: { position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center' },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE },
});

export default Slider;
