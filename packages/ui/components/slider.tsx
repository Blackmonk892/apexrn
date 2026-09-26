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
  style?: any;
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
  const maxTravel = Math.max(0, trackWidth - THUMB_WIDTH);
  
  const translateX = useSharedValue(0);
  const offset = useSharedValue(0);
  
  useEffect(() => {
    if (trackWidth > 0) {
      const clampedValue = Math.max(min, Math.min(value, max));
      const ratio = (clampedValue - min) / (max - min);
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
      nextX = Math.max(0, Math.min(nextX, maxTravel));
      translateX.value = nextX;
    })
    .onEnd(() => {
      const currentRatio = translateX.value / maxTravel;
      const rawValue = min + currentRatio * (max - min);
      
      const snappedValue = Math.round(rawValue / step) * step;
      const finalValue = Math.max(min, Math.min(snappedValue, max));
      
      const finalRatio = (finalValue - min) / (max - min);
      
      translateX.value = withTiming(finalRatio * maxTravel, { 
        duration: 100,
        easing: Easing.out(Easing.quad) 
      });
      
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
      <View 
        style={cn(
          styles.trackLine,
          { backgroundColor: colors.border },
          disabled && { backgroundColor: colors.mutedForeground }
        )} 
      />

      <GestureDetector gesture={pan}>
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