import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, PressableProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing, 
  interpolateColor 
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SwitchProps extends Omit<PressableProps, 'onPress' | 'onPressIn' | 'onPressOut'> {
  /**
   * The controlled checked state of the switch.
   */
  checked: boolean;
  /**
   * Callback fired when the switch state changes.
   */
  onCheckedChange: (checked: boolean) => void;
  /**
   * Disables the switch, applying muted styles and preventing interactions.
   * @default false
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 2; // Specific 2px shadow for the thumb
const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const THUMB_SIZE = 24;

// Calculate travel distance:
// Inner track width = TRACK_WIDTH - (borderWidth * 2) = 56 - 4 = 52.
// Total thumb footprint (including 2px shadow) = THUMB_SIZE + SHADOW_OFFSET = 26.
// Available travel = 52 - 26 = 26.
// We subtract an extra 2px to give it a 1px padding on the right side.
const THUMB_TRAVEL_DISTANCE = 24;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  style,
  ...props
}: SwitchProps) {
  const isChecked = useSharedValue(checked ? 1 : 0);

  // Sync internal animated value with external prop
  useEffect(() => {
    isChecked.value = withTiming(checked ? 1 : 0, { 
      duration: 150, 
      easing: Easing.inOut(Easing.quad) 
    });
  }, [checked, isChecked]);

  const handlePress = () => {
    if (disabled) return;
    onCheckedChange(!checked);
  };

  const animatedTrackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        isChecked.value,
        [0, 1],
        [colors.light.muted, colors.light.primary]
      ),
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: isChecked.value * THUMB_TRAVEL_DISTANCE },
      ],
    };
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.track,
        disabled && styles.trackDisabled,
        animatedTrackStyle,
        style,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      {...props}
    >
      <AnimatedView style={[styles.thumbContainer, animatedThumbStyle]}>
        {/* Shadow is hidden in disabled state per brutalism rules */}
        {!disabled && <View style={styles.thumbShadow} />}
        
        <View 
          style={cn(
            styles.thumbSurface,
            disabled && styles.thumbSurfaceDisabled
          )} 
        />
      </AnimatedView>
    </AnimatedPressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard,
    borderRadius: 0,
    justifyContent: 'center',
    paddingHorizontal: 2, // Gives the thumb a slight inner padding from the track edges
  },
  trackDisabled: {
    backgroundColor: colors.light.muted, // Forces muted bg regardless of checked state
    borderColor: colors.light.mutedForeground,
  },
  thumbContainer: {
    position: 'relative',
    width: THUMB_SIZE + SHADOW_OFFSET,
    height: THUMB_SIZE + SHADOW_OFFSET,
  },
  thumbShadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  thumbSurface: {
    position: 'relative',
    zIndex: 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    borderRadius: 0,
  },
  thumbSurfaceDisabled: {
    backgroundColor: colors.light.muted,
    borderColor: colors.light.mutedForeground,
    borderWidth: borderWidths.standard, // Lighten the border if disabled to match inputs
  },
});