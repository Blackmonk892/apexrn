import { forwardRef, useEffect, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { spacing, typography } from '../lib/colors';
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
  leadingIcon?: ReactNode;
  /**
   * Optional icon to display on the right side of the input.
   */
  trailingIcon?: ReactNode;
  /**
   * Makes the trailing icon tappable. When provided, the trailing icon is
   * wrapped in a Pressable with button semantics.
   */
  onTrailingIconPress?: () => void;
  /**
   * Disables the input, applying muted styles and preventing interactions.
   * @default false
   */
  disabled?: boolean;
  /**
   * Style overrides for the underlying TextInput.
   */
  inputStyle?: StyleProp<TextStyle>;
  /**
   * Style overrides for the brutalist surface (borders, background).
   * Use this — not `style` — for border overrides such as error states.
   */
  surfaceStyle?: StyleProp<ViewStyle>;
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
  onTrailingIconPress,
  disabled = false,
  inputStyle,
  surfaceStyle,
  style,
  onFocus,
  onBlur,
  placeholderTextColor,
  ...props
}, ref) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  // Disabling mid-focus must not leave the focused styling stuck on.
  useEffect(() => {
    if (disabled) {
      setIsFocused(false);
      focusProgress.value = withTiming(0, {
        duration: 80,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [disabled, focusProgress]);

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    if (disabled) return;
    setIsFocused(true);
    focusProgress.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    onFocus?.(e);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
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
        surfaceStyle={[styles.surface, surfaceStyle]}
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
          onTrailingIconPress && !disabled ? (
            <Pressable
              onPress={onTrailingIconPress}
              style={cn(styles.iconContainer, styles.trailingIcon)}
              accessibilityRole="button"
              accessibilityLabel="Input action"
              hitSlop={8}
            >
              {trailingIcon}
            </Pressable>
          ) : (
            <View style={cn(styles.iconContainer, styles.trailingIcon)}>
              {trailingIcon}
            </View>
          )
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
