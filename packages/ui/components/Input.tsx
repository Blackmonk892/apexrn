import React, { forwardRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
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
  placeholderTextColor,
  ...props
}, ref) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = (e: any) => {
    if (disabled) return;
    setIsFocused(true);
    focusProgress.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
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
        backgroundColor={disabled ? colors.muted : colors.background}
        borderColor={disabled ? colors.mutedForeground : colors.border}
        surfaceStyle={styles.surface}
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
            { color: colors.foreground },
            disabled && { color: colors.mutedForeground },
            inputStyle
          )}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
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
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: typography.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    padding: 0,
    margin: 0,
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
