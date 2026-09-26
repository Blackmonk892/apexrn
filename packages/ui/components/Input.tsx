import React, { forwardRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

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
  // Focus-driven shadow reveal, not press physics — kept independent of
  // BrutalSurface's own (unused here, since pressable={false}) press timing.
  const focusProgress = useSharedValue(0);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (disabled) return;
    setIsFocused(true);
    focusProgress.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (disabled) return;
    setIsFocused(false);
    focusProgress.value = withTiming(0, {
      duration: 80,
      easing: Easing.in(Easing.quad),
    });
    onBlur?.(e);
  };

  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
  }));

  return (
    <View style={cn(styles.container, style)}>
      <BrutalSurface
        pressable={false}
        hasShadow={!disabled}
        shadowStyle={animatedShadowStyle}
        offset={SHADOW_OFFSET}
        borderWidth={isFocused ? 'heavy' : 'standard'}
        surfaceStyle={[styles.surface, disabled && styles.surfaceDisabled]}
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
      </BrutalSurface>
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
    width: '100%',
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    // Provide a stable min-height so border snapping doesn't collapse the layout
    minHeight: 48,
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
