import { useEffect, useState } from 'react';
import { Pressable, type PressableProps, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { borderWidths } from '../lib/colors';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SwitchProps extends Omit<PressableProps, 'onPress' | 'onPressIn' | 'onPressOut'> {
  /**
   * The controlled checked state. Omit for an uncontrolled switch.
   */
  checked?: boolean;
  /**
   * Initial state when uncontrolled.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * Callback fired when the switch state changes.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Disables the switch.
   * @default false
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 2;
const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const TRACK_PADDING = 2;
const THUMB_SIZE = 24;
// The thumb container includes its shadow margin, and the track's border
// sits inside its width, so both come off the travel distance:
// 56 - 2*2 (border) - 2*2 (padding) - (24 + 2) = 22.
const THUMB_TRAVEL_DISTANCE =
  TRACK_WIDTH - borderWidths.standard * 2 - TRACK_PADDING * 2 - (THUMB_SIZE + SHADOW_OFFSET);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  style,
  hitSlop = 8,
  ...props
}: SwitchProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = checkedProp ?? internalChecked;
  const isChecked = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    const to = checked ? 1 : 0;
    isChecked.value = reduceMotion
      ? to
      : withTiming(to, { duration: 150, easing: Easing.inOut(Easing.quad) });
  }, [checked, reduceMotion, isChecked]);

  const handlePress = () => {
    if (disabled) return;
    if (checkedProp === undefined) setInternalChecked(!checked);
    onCheckedChange?.(!checked);
  };

  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(isChecked.value, [0, 1], [colors.muted, colors.primary]),
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: isChecked.value * THUMB_TRAVEL_DISTANCE }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.track,
        { borderColor: colors.border },
        animatedTrackStyle,
        // Disabled styling wins over the animated track color so a
        // disabled-ON switch doesn't render a primary track + muted thumb.
        disabled && { backgroundColor: colors.muted, borderColor: colors.mutedForeground },
        style,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      hitSlop={hitSlop}
      {...props}
    >
      <AnimatedView style={[styles.thumbContainer, animatedThumbStyle]}>
        <BrutalSurface
          pressable={false}
          hasShadow={!disabled}
          offset={SHADOW_OFFSET}
          backgroundColor={disabled ? colors.muted : colors.background}
          borderColor={disabled ? colors.mutedForeground : colors.border}
          surfaceStyle={styles.thumbSurface}
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
    borderWidth: borderWidths.standard,
    borderRadius: 0,
    justifyContent: 'center',
    paddingHorizontal: TRACK_PADDING,
  },
  thumbContainer: {
    position: 'relative',
    width: THUMB_SIZE + SHADOW_OFFSET,
    height: THUMB_SIZE + SHADOW_OFFSET,
  },
  thumbSurface: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
});
