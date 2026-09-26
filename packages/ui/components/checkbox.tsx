import React, { useEffect } from 'react';
import { PressableProps, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../lib/colors';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CheckboxProps extends Omit<PressableProps, 'onPress' | 'onPressIn' | 'onPressOut'> {
  /**
   * The controlled checked state of the checkbox.
   */
  checked: boolean;
  /**
   * Callback fired when the checkbox state changes.
   */
  onCheckedChange: (checked: boolean) => void;
  /**
   * Disables the checkbox, applying muted styles and preventing interactions.
   * @default false
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 2; // Fixed 2px hard shadow for this component
const CHECKBOX_SIZE = 24;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedView = Animated.createAnimatedComponent(View);

export default function Checkbox({
  checked,
  onCheckedChange,
  disabled = false,
  style,
  ...props
}: CheckboxProps) {
  const isChecked = useSharedValue(checked ? 1 : 0);

  // Sync internal animated value with external prop
  useEffect(() => {
    isChecked.value = withTiming(checked ? 1 : 0, {
      duration: 150,
      easing: Easing.inOut(Easing.quad),
    });
  }, [checked, isChecked]);

  const handlePress = () => {
    if (disabled) return;
    onCheckedChange(!checked);
  };

  // Background fills from background -> foreground when checked. The
  // press-in/out translate + squash is handled by BrutalSurface itself.
  const animatedFillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isChecked.value,
      [0, 1],
      [colors.light.background, colors.light.foreground]
    ),
  }));

  // Checkmark scales in from 0 to 1
  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: isChecked.value }],
      opacity: isChecked.value,
    };
  });

  return (
    <BrutalSurface
      style={cn(styles.container, style)}
      surfaceStyle={[styles.surface, disabled && styles.surfaceDisabled, !disabled && animatedFillStyle]}
      offset={SHADOW_OFFSET}
      borderWidth="heavy"
      hasShadow={!disabled}
      disabled={disabled}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      {...props}
    >
      <AnimatedView style={[styles.iconContainer, animatedCheckStyle]}>
        <Svg
          width={CHECKBOX_SIZE - 8}
          height={CHECKBOX_SIZE - 8}
          viewBox="0 0 24 24"
          fill="none"
          // Use background color for the checkmark so it contrasts against the black filled box
          stroke={disabled ? colors.light.mutedForeground : colors.light.background}
          strokeWidth="4" // Thick brutalist stroke
          strokeLinecap="square" // Harsh square caps instead of round
          strokeLinejoin="miter"
        >
          <Path d="M20 6L9 17l-5-5" />
        </Svg>
      </AnimatedView>
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
  },
  surface: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surfaceDisabled: {
    backgroundColor: colors.light.muted,
    borderColor: colors.light.mutedForeground,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
