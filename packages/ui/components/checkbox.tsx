import { useEffect, useState } from 'react';
import {
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { touchTarget } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CheckboxProps extends Omit<PressableProps, 'onPress' | 'onPressIn' | 'onPressOut' | 'style'> {
  /**
   * The controlled checked state. Omit for an uncontrolled checkbox.
   */
  checked?: boolean;
  /**
   * Initial state when uncontrolled.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * Callback fired when the checkbox state changes.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Disables the checkbox.
   * @default false
   */
  disabled?: boolean;
  /**
   * Container style override. Note: function styles are not supported here
   * (the style targets the outer wrapper, not the Pressable directly).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Expands the touch target beyond the 24px visual box.
   * @default enough to reach the platform touch target (44pt iOS / 48dp Android)
   */
  hitSlop?: PressableProps['hitSlop'];
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

export function Checkbox({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  style,
  hitSlop = Math.ceil((touchTarget - CHECKBOX_SIZE) / 2),
  ...props
}: CheckboxProps) {
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
      hitSlop={hitSlop}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      aria-checked={checked}
      aria-disabled={disabled}
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

export default Checkbox;
