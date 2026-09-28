import { useEffect } from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing, 
  interpolateColor 
} from 'react-native-reanimated';

import { borderWidths } from '../lib/colors';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal_surface';

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
// Track inner width minus padding and thumb: 56 - 2*2 - 24 = 28.
const THUMB_TRAVEL_DISTANCE = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_SIZE;

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
  hitSlop = 8,
  ...props
}: SwitchProps) {
  const { colors } = useTheme();
  const isChecked = useSharedValue(checked ? 1 : 0);

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
        [colors.muted, colors.primary]
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
        { borderColor: colors.border },
        animatedTrackStyle,
        // Disabled styling wins over the animated track color so a
        // disabled-ON switch doesn't render a primary track + muted thumb.
        disabled && { backgroundColor: colors.muted, borderColor: colors.mutedForeground },
        style,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
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