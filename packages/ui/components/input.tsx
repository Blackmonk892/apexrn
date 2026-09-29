import { forwardRef, useEffect, type ReactNode } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { controlHeight, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface InputProps extends TextInputProps {
  /**
   * Optional icon to display on the left side of the input. Decorative.
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
   * Accessibility label for the tappable trailing icon.
   * @default 'Input action'
   */
  trailingIconLabel?: string;
  /**
   * Marks the value as invalid. The border and shadow switch to the
   * destructive colour and the shadow stays on even without focus, so the
   * state is readable without relying on hue alone.
   * @default false
   */
  error?: boolean;
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
  trailingIconLabel = 'Input action',
  error = false,
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
  const reduceMotion = useReducedMotion();
  // 0 = resting, 1 = shadow fully shown (focused).
  const focusProgress = useSharedValue(0);

  const animateTo = (to: number) => {
    focusProgress.value = reduceMotion
      ? to
      : withTiming(to, { duration: to ? 100 : 80, easing: to ? Easing.out(Easing.quad) : Easing.in(Easing.quad) });
  };

  // Disabling mid-focus must not leave the focus shadow stuck on.
  useEffect(() => {
    if (disabled) focusProgress.value = 0;
  }, [disabled, focusProgress]);

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    if (!disabled) animateTo(1);
    onFocus?.(e);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    animateTo(0);
    onBlur?.(e);
  };

  // The shadow layer is always laid out (so size never changes between
  // states); focus only fades its opacity. Errors keep it visible.
  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: error && !disabled ? 1 : focusProgress.value,
  }));

  const accent = error && !disabled ? colors.destructive : colors.border;

  return (
    <View style={cn(styles.container, style)}>
      <BrutalSurface
        pressable={false}
        hasShadow
        shadowStyle={animatedShadowStyle}
        offset={SHADOW_OFFSET}
        borderWidth="heavy"
        backgroundColor={disabled ? colors.muted : colors.background}
        borderColor={disabled ? colors.mutedForeground : accent}
        shadowColor={error && !disabled ? colors.destructive : undefined}
        surfaceStyle={[styles.surface, { minHeight: controlHeight.md }, surfaceStyle]}
      >
        {leadingIcon ? (
          <View
            style={[styles.iconContainer, { paddingLeft: spacing.md }]}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            {leadingIcon}
          </View>
        ) : null}

        <TextInput
          ref={ref}
          style={cn(
            styles.input,
            {
              fontSize: typography.md,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              color: colors.foreground,
            },
            disabled && { color: colors.mutedForeground },
            inputStyle
          )}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
          maxFontSizeMultiplier={1.3}
          aria-invalid={error || undefined}
          accessibilityState={{ disabled }}
          {...props}
        />

        {trailingIcon ? (
          onTrailingIconPress && !disabled ? (
            <Pressable
              onPress={onTrailingIconPress}
              style={[styles.iconContainer, { paddingRight: spacing.md }]}
              accessibilityRole="button"
              accessibilityLabel={trailingIconLabel}
              hitSlop={8}
            >
              {trailingIcon}
            </Pressable>
          ) : (
            <View
              style={[styles.iconContainer, { paddingRight: spacing.md }]}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              {trailingIcon}
            </View>
          )
        ) : null}
      </BrutalSurface>
    </View>
  );
});

Input.displayName = 'Input';
export { Input };
export default Input;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // stretch (not width: 100%) so the shadow's margin doesn't push past the parent.
  container: {
    alignSelf: 'stretch',
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
