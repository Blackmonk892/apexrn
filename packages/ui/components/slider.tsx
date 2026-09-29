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
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { borderWidths, spacing, touchTarget } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SliderProps extends Omit<ViewProps, 'style'> {
  /**
   * The controlled value. Omit for an uncontrolled slider.
   */
  value?: number;
  /**
   * Initial value when uncontrolled.
   * @default min
   */
  defaultValue?: number;
  /**
   * Fires whenever the stepped value changes, including while dragging.
   */
  onValueChange?: (value: number) => void;
  /**
   * Fires once with the final value when a drag or tap ends.
   */
  onSlidingComplete?: (value: number) => void;
  /**
   * Minimum value.
   * @default 0
   */
  min?: number;
  /**
   * Maximum value.
   * @default 100
   */
  max?: number;
  /**
   * The stepping interval.
   * @default 1
   */
  step?: number;
  /**
   * Disables the slider.
   * @default false
   */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 2;
const THUMB_WIDTH = 16;
const THUMB_HEIGHT = 32;
const ROW_HEIGHT = Math.max(touchTarget, THUMB_HEIGHT + SHADOW_OFFSET);
const TRACK_HEIGHT = borderWidths.heavy;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Slider({
  value: valueProp,
  defaultValue,
  onValueChange,
  onSlidingComplete,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  style,
  ...props
}: SliderProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const value = valueProp ?? internalValue;
  // Reserve the thumb's shadow offset so the thumb never overflows the track.
  const maxTravel = Math.max(0, trackWidth - THUMB_WIDTH - SHADOW_OFFSET);

  // Sanitized domain: degenerate configs (max <= min, non-finite, step <= 0)
  // collapse to a harmless no-op instead of producing NaN values.
  const range = max - min;
  const validRange = Number.isFinite(range) && range > 0 ? range : 0;
  const validStep = Number.isFinite(step) && step > 0 ? step : 0;

  const clampToDomain = (raw: number) => {
    if (!Number.isFinite(raw) || validRange <= 0) return min;
    const clamped = Math.max(min, Math.min(raw, max));
    if (validStep <= 0) return clamped;
    return Math.max(min, Math.min(Math.round(clamped / validStep) * validStep, max));
  };

  const ratioFor = (v: number) =>
    validRange > 0 ? (Math.max(min, Math.min(v, max)) - min) / validRange : 0;

  const translateX = useSharedValue(0);
  const gestureOffset = useSharedValue(0);
  const maxTravelSV = useSharedValue(0);
  const isDraggingSV = useSharedValue(false);
  const lastEmitted = useSharedValue(Number.NaN);

  // Keep the worklet-visible travel distance in sync across rotation/resize.
  useEffect(() => {
    maxTravelSV.value = maxTravel;
  }, [maxTravel, maxTravelSV]);

  useEffect(() => {
    // Don't fight an in-flight drag when the parent echoes values back.
    if (trackWidth > 0 && !isDraggingSV.value) {
      const to = ratioFor(value) * maxTravel;
      translateX.value = reduceMotion
        ? to
        : withTiming(to, { duration: 150, easing: Easing.out(Easing.quad) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ratioFor is derived from min/max/value
  }, [value, trackWidth, min, max, maxTravel, reduceMotion, translateX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const commit = (next: number) => {
    if (valueProp === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const complete = (next: number) => {
    onSlidingComplete?.(next);
  };

  const interactive = !disabled && trackWidth > 0 && validRange > 0;

  const pan = Gesture.Pan()
    .enabled(interactive)
    // Horizontal-only: vertical drags belong to the parent ScrollView and
    // must not move the thumb or trap scrolling.
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      isDraggingSV.value = true;
      gestureOffset.value = translateX.value;
      lastEmitted.value = Number.NaN;
    })
    .onUpdate((event) => {
      const travel = maxTravelSV.value;
      if (travel <= 0) return;
      const nextX = Math.max(0, Math.min(gestureOffset.value + event.translationX, travel));
      translateX.value = nextX;
      // Inline math: worklets cannot call the JS closures above.
      let live = Math.max(min, Math.min(min + (nextX / travel) * validRange, max));
      if (validStep > 0) {
        live = Math.max(min, Math.min(Math.round(live / validStep) * validStep, max));
      }
      if (live !== lastEmitted.value) {
        lastEmitted.value = live;
        runOnJS(commit)(live);
      }
    })
    .onEnd(() => {
      isDraggingSV.value = false;
      const travel = maxTravelSV.value;
      if (travel <= 0 || validRange <= 0) return;
      let finalValue = Math.max(min, Math.min(min + (translateX.value / travel) * validRange, max));
      if (validStep > 0) {
        finalValue = Math.max(min, Math.min(Math.round(finalValue / validStep) * validStep, max));
      }
      // Snap the thumb to the stepped position.
      translateX.value = withTiming(((finalValue - min) / validRange) * travel, {
        duration: reduceMotion ? 0 : 100,
        easing: Easing.out(Easing.quad),
      });
      if (finalValue !== lastEmitted.value) runOnJS(commit)(finalValue);
      runOnJS(complete)(finalValue);
    });

  const tap = Gesture.Tap()
    .enabled(interactive)
    .onEnd((event) => {
      const travel = maxTravelSV.value;
      if (travel <= 0 || validRange <= 0) return;
      // Tap-to-seek: center the thumb on the tap point (inline worklet math).
      const x = Math.max(0, Math.min(event.x - THUMB_WIDTH / 2, travel));
      let finalValue = Math.max(min, Math.min(min + (x / travel) * validRange, max));
      if (validStep > 0) {
        finalValue = Math.max(min, Math.min(Math.round(finalValue / validStep) * validStep, max));
      }
      translateX.value = withTiming(((finalValue - min) / validRange) * travel, {
        duration: reduceMotion ? 0 : 100,
        easing: Easing.out(Easing.quad),
      });
      runOnJS(commit)(finalValue);
      runOnJS(complete)(finalValue);
    });

  const composedGestures = Gesture.Race(pan, tap);

  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (disabled || validRange <= 0) return;
    const delta = validStep > 0 ? validStep : validRange / 20;
    const next = clampToDomain(
      event.nativeEvent.actionName === 'increment' ? value + delta : value - delta,
    );
    commit(next);
    complete(next);
  };

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // The filled part of the track is a full-width bar scaled from the left
  // edge (transform only) up to the thumb's centre.
  const animatedFillStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: trackWidth > 0 ? (translateX.value + THUMB_WIDTH / 2) / trackWidth : 0 },
    ],
    transformOrigin: 'left center',
  }));

  return (
    <GestureDetector gesture={composedGestures}>
      <View
        style={cn(styles.container, { marginBottom: spacing.sm }, style)}
        onLayout={handleLayout}
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: clampToDomain(value) }}
        accessibilityState={{ disabled }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={handleAccessibilityAction}
        {...props}
      >
        <View
          style={[
            styles.trackLine,
            { backgroundColor: disabled ? colors.mutedForeground : colors.border },
          ]}
        />
        {disabled ? null : (
          <Animated.View
            style={[styles.trackLine, { backgroundColor: colors.primary }, animatedFillStyle]}
          />
        )}

        <Animated.View style={[styles.thumbWrapper, animatedThumbStyle]}>
          <BrutalSurface
            pressable={false}
            hasShadow={!disabled}
            offset={SHADOW_OFFSET}
            borderWidth="standard"
            backgroundColor={disabled ? colors.muted : colors.background}
            borderColor={disabled ? colors.mutedForeground : colors.border}
            surfaceStyle={styles.thumbSurface}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    height: ROW_HEIGHT,
    justifyContent: 'center',
    position: 'relative',
  },
  trackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
  },
  thumbWrapper: {
    position: 'absolute',
    top: (ROW_HEIGHT - (THUMB_HEIGHT + SHADOW_OFFSET)) / 2,
    left: 0,
    width: THUMB_WIDTH + SHADOW_OFFSET,
    height: THUMB_HEIGHT + SHADOW_OFFSET,
  },
  thumbSurface: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
  },
});
