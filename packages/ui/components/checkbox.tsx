import React, { useEffect } from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing, 
  interpolateColor
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

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
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function Checkbox({
  checked,
  onCheckedChange,
  disabled = false,
  style,
  ...props
}: CheckboxProps) {
  const isPressed = useSharedValue(0);
  const isChecked = useSharedValue(checked ? 1 : 0);

  // Sync internal animated value with external prop
  useEffect(() => {
    isChecked.value = withTiming(checked ? 1 : 0, { 
      duration: 150, 
      easing: Easing.inOut(Easing.quad) 
    });
  }, [checked, isChecked]);

  const handlePressIn = () => {
    if (disabled) return;
    isPressed.value = withTiming(1, { 
      duration: 100, 
      easing: Easing.out(Easing.quad) 
    });
  };

  const handlePressOut = () => {
    if (disabled) return;
    isPressed.value = withTiming(0, { 
      duration: 80, 
      easing: Easing.in(Easing.quad) 
    });
  };

  const handlePress = () => {
    if (disabled) return;
    onCheckedChange(!checked);
  };

  // 1. Surface translates (0,0) to (2,2) to sink into the shadow
  // 2. Background fills from background -> foreground when checked
  const animatedSurfaceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: isPressed.value * SHADOW_OFFSET },
        { translateY: isPressed.value * SHADOW_OFFSET },
      ],
      backgroundColor: interpolateColor(
        isChecked.value,
        [0, 1],
        [colors.light.background, colors.light.foreground]
      ),
    };
  });

  // Checkmark scales in from 0 to 1
  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: isChecked.value }],
      opacity: isChecked.value,
    };
  });

  return (
    <View style={cn(styles.container, style)}>
      {!disabled && <View style={styles.shadow} />}
      
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.surface,
          disabled && styles.surfaceDisabled,
          animatedSurfaceStyle,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
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
      </AnimatedPressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    // Reserve space so the 2px shadow doesn't clip
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    borderRadius: 0,
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