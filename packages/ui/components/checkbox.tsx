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

import { useTheme } from '../lib/theme';
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
   * Disables the checkbox.
   * @default false
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 2;
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
  const { colors } = useTheme();
  const isChecked = useSharedValue(checked ? 1 : 0);

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

  const animatedFillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isChecked.value,
      [0, 1],
      [colors.background, colors.foreground]
    ),
  }));

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: isChecked.value }],
      opacity: isChecked.value,
    };
  });

  return (
    <BrutalSurface
      style={cn(styles.container, style)}
      surfaceStyle={[
        styles.surface, 
        disabled && { backgroundColor: colors.muted, borderColor: colors.mutedForeground }, 
        !disabled && animatedFillStyle
      ]}
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
          stroke={disabled ? colors.mutedForeground : colors.background}
          strokeWidth="4"
          strokeLinecap="square"
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
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
