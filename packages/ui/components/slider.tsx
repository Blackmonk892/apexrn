import { useEffect, useState } from 'react';
import {
  AccessibilityActionEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SliderProps extends Omit<ViewProps, 'style'> {
  /**
   * The current value of the slider.
   */
  value: number;
  /**
   * Callback fired when the slider value changes after dragging ends.
   */
  onValueChange: (value: number) => void;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  style,
  ...props
}: SliderProps) {
  const { colors } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
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

  // Keep the worklet-visible travel distance in sync across rotation/resize.
  useEffect(() => {
    maxTravelSV.value = maxTravel;
  }, [maxTravel, maxTravelSV]);

  useEffect(() => {
    // Don't fight an in-flight drag when the parent echoes values back.
    if (trackWidth > 0 && !isDraggingSV.value) {
      translateX.value = withTiming(ratioFor(value) * maxTravel, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [value, trackWidth, min, max, maxTravel, translateX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const pan = Gesture.Pan()
    .enabled(!disabled && trackWidth > 0 && validRange > 0)
    // Horizontal-only: vertical drags belong to the parent ScrollView and
    // must not move the thumb or trap scrolling.
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      isDraggingSV.value = true;
      gestureOffset.value = translateX.value;
    })
    .onUpdate((event) => {
      const travel = maxTravelSV.value;
      let nextX = gestureOffset.value + event.translationX;
      nextX = Math.max(0, Math.min(nextX, travel));
      translateX.value = nextX;
    })
    .onEnd(() => {
      isDraggingSV.value = false;
      const travel = maxTravelSV.value;
      if (travel <= 0 || validRange <= 0) return;
      // Inline math: worklets cannot call the JS closures above.
      const currentRatio = translateX.value / travel;
      const rawValue = min + currentRatio * validRange;
      let finalValue = Math.max(min, Math.min(rawValue, max));
      if (validStep > 0) {
        finalValue = Math.max(min, Math.min(Math.round(finalValue / validStep) * validStep, max));
      }
      const finalRatio = (finalValue - min) / validRange;

      translateX.value = withTiming(finalRatio * travel, {
        duration: 100,
        easing: Easing.out(Easing.quad)
      });

      runOnJS(onValueChange)(finalValue);
    });

  const tap = Gesture.Tap()
    .enabled(!disabled && trackWidth > 0 && validRange > 0)
    .onEnd((event) => {
      const travel = maxTravelSV.value;
      if (travel <= 0 || validRange <= 0) return;
      // Tap-to-seek: center the thumb on the tap point (inline worklet math).
      const x = Math.max(0, Math.min(event.x - THUMB_WIDTH / 2, travel));
      translateX.value = withTiming(x, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      });
      const rawValue = min + (x / travel) * validRange;
      let finalValue = Math.max(min, Math.min(rawValue, max));
      if (validStep > 0) {
        finalValue = Math.max(min, Math.min(Math.round(finalValue / validStep) * validStep, max));
      }
      runOnJS(onValueChange)(finalValue);
    });

  const composedGestures = Gesture.Race(pan, tap);

  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (disabled || validRange <= 0) return;
    const delta = validStep > 0 ? validStep : validRange / 20;
    const next =
      event.nativeEvent.actionName === 'increment' ? value + delta : value - delta;
    onValueChange(clampToDomain(next));
  };

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureDetector gesture={composedGestures}>
      <View
        style={cn(styles.container, style)}
        onLayout={handleLayout}
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: clampToDomain(value) }}
        accessibilityState={{ disabled }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={handleAccessibilityAction}
        {...props}
      >
        <View
          style={cn(
            styles.trackLine,
            { backgroundColor: colors.border },
            disabled && { backgroundColor: colors.mutedForeground }
          )}
        />

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
    width: '100%',
    height: THUMB_HEIGHT + SHADOW_OFFSET,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.sm,
  },
  trackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: borderWidths.standard,
  },
  thumbWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: THUMB_WIDTH + SHADOW_OFFSET,
    height: THUMB_HEIGHT + SHADOW_OFFSET,
  },
  thumbSurface: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
  },
});