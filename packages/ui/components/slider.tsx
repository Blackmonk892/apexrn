import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewProps, LayoutChangeEvent } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

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
   * Disables the slider, applying muted styles and preventing interactions.
   * @default false
   */
  disabled?: boolean;
  /**
   * Optional style overrides for the root container.
   */
  style?: any;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 2; // Specific 2px hard shadow requested for the thumb
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
  const [trackWidth, setTrackWidth] = useState(0);
  const maxTravel = Math.max(0, trackWidth - THUMB_WIDTH);
  
  const translateX = useSharedValue(0);
  const offset = useSharedValue(0);
  
  // Calculate initial/external value changes
  useEffect(() => {
    if (trackWidth > 0) {
      const clampedValue = Math.max(min, Math.min(value, max));
      const ratio = (clampedValue - min) / (max - min);
      // Smoothly animate to new value if changed externally
      translateX.value = withTiming(ratio * maxTravel, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [value, trackWidth, min, max, maxTravel, translateX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const pan = Gesture.Pan()
    .enabled(!disabled && trackWidth > 0)
    .onStart(() => {
      offset.value = translateX.value;
    })
    .onUpdate((event) => {
      let nextX = offset.value + event.translationX;
      // Clamp within the track bounds
      nextX = Math.max(0, Math.min(nextX, maxTravel));
      translateX.value = nextX;
    })
    .onEnd(() => {
      const currentRatio = translateX.value / maxTravel;
      const rawValue = min + currentRatio * (max - min);
      
      // Snap to step
      const snappedValue = Math.round(rawValue / step) * step;
      const finalValue = Math.max(min, Math.min(snappedValue, max));
      
      const finalRatio = (finalValue - min) / (max - min);
      
      // Animate the thumb to the exact snapped position
      translateX.value = withTiming(finalRatio * maxTravel, { 
        duration: 100,
        easing: Easing.out(Easing.quad) 
      });
      
      // Safely call back to JS thread with the new value
      runOnJS(onValueChange)(finalValue);
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View 
      style={cn(styles.container, style)} 
      onLayout={handleLayout}
      accessibilityRole="adjustable"
      accessibilityValue={{ min, max, now: value }}
      accessibilityState={{ disabled }}
      {...props}
    >
      {/* Brutalist Thick Track Line */}
      <View 
        style={cn(
          styles.trackLine,
          disabled && styles.trackLineDisabled
        )} 
      />

      {/* Draggable DJ-Fader Thumb */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumbWrapper, animatedThumbStyle]}>
          {/* Shadow is hidden in disabled state per brutalism rules */}
          {!disabled && <View style={styles.thumbShadow} />}
          
          <View 
            style={cn(
              styles.thumbSurface,
              disabled && styles.thumbSurfaceDisabled
            )} 
          />
        </Animated.View>
      </GestureDetector>
    </View>
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
    // Extra margin so the shadow doesn't clip
    marginBottom: spacing.sm,
  },
  trackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: borderWidths.standard, // 2px exact track line as requested
    backgroundColor: colors.light.border,
  },
  trackLineDisabled: {
    backgroundColor: colors.light.mutedForeground,
  },
  thumbWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: THUMB_WIDTH + SHADOW_OFFSET,
    height: THUMB_HEIGHT + SHADOW_OFFSET,
  },
  thumbShadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard, // Matching standard border so tiny elements aren't overwhelmed
    zIndex: 1,
    borderRadius: 0,
  },
  thumbSurface: {
    position: 'relative',
    zIndex: 2,
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard, 
    borderRadius: 0,
  },
  thumbSurfaceDisabled: {
    backgroundColor: colors.light.muted,
    borderColor: colors.light.mutedForeground,
  },
});