import React, { forwardRef, useState } from 'react';
import { 
  Pressable, 
  StyleProp,
  StyleSheet, 
  TextInput, 
  TextInputProps, 
  TextStyle,
  View, 
  NativeSyntheticEvent, 
  TextInputFocusEventData 
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface InputProps extends TextInputProps {
  /**
   * Optional icon to display on the left side of the input.
   */
  leadingIcon?: React.ReactNode;
  /**
   * Optional icon to display on the right side of the input.
   */
  trailingIcon?: React.ReactNode;
  /**
   * Disables the input, applying muted styles and preventing interactions.
   * @default false
   */
  disabled?: boolean;
  /**
   * Style overrides for the underlying TextInput.
   */
  inputStyle?: StyleProp<TextStyle>;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Input = forwardRef<TextInput, InputProps>(({
  leadingIcon,
  trailingIcon,
  disabled = false,
  inputStyle,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (disabled) return;
    setIsFocused(true);
    // Shadow appears smoothly using the standard outward timing
    focusProgress.value = withTiming(1, { 
      duration: 100, 
      easing: Easing.out(Easing.quad) 
    });
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (disabled) return;
    setIsFocused(false);
    // Shadow disappears quickly using the standard inward timing
    focusProgress.value = withTiming(0, { 
      duration: 80, 
      easing: Easing.in(Easing.quad) 
    });
    onBlur?.(e);
  };

  const animatedShadowStyle = useAnimatedStyle(() => {
    return {
      opacity: focusProgress.value,
    };
  });

  return (
    <View style={cn(styles.container, style)}>
      {/* The shadow is strictly positioned behind the surface. 
        It only renders if not disabled, maintaining strict brutalist rules.
      */}
      {!disabled && (
        <Animated.View style={[styles.shadow, animatedShadowStyle]} />
      )}
      
      <View
        style={cn(
          styles.surface,
          isFocused ? styles.surfaceFocused : styles.surfaceResting,
          disabled && styles.surfaceDisabled
        )}
      >
        {leadingIcon && (
          <View style={cn(styles.iconContainer, styles.leadingIcon)}>
            {leadingIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={cn(
            styles.input,
            disabled && styles.textDisabled,
            inputStyle
          )}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.light.mutedForeground}
          accessibilityState={{ disabled }}
          {...props}
        />
        
        {trailingIcon && (
          <View style={cn(styles.iconContainer, styles.trailingIcon)}>
            {trailingIcon}
          </View>
        )}
      </View>
    </View>
  );
});

Input.displayName = 'Input';
export default Input;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    // Reserve space so the 4px shadow doesn't clip into adjacent elements
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderRadius: 0,
    // Provide a stable min-height so border snapping doesn't collapse the layout
    minHeight: 48,
  },
  surfaceResting: {
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard,
  },
  surfaceFocused: {
    borderColor: colors.light.border,
    // Snaps to heavy border exactly as requested on focus
    borderWidth: borderWidths.heavy,
  },
  surfaceDisabled: {
    backgroundColor: colors.light.muted,
    borderColor: colors.light.mutedForeground,
    borderWidth: borderWidths.standard,
  },
  input: {
    flex: 1,
    color: colors.light.foreground,
    fontSize: typography.md,
    fontFamily: 'System', // Replace with your brutalist font family if configured
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    // Remove default Android padding
    padding: 0, 
    margin: 0,
  },
  textDisabled: {
    color: colors.light.mutedForeground,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  leadingIcon: {
    paddingLeft: spacing.md,
  },
  trailingIcon: {
    paddingRight: spacing.md,
  },
});